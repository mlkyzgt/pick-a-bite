package com.aliyilmaz.services.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aliyilmaz.ai.MenuContextBuilder;
import com.aliyilmaz.ai.GroqAssistantService;
import com.aliyilmaz.ai.StructuredQueryParser;
import com.aliyilmaz.dto.DtoChatIstek;
import com.aliyilmaz.dto.DtoChatYanit;
import com.aliyilmaz.dto.DtoMenu;
import com.aliyilmaz.dto.DtoOnerilenUrun;
import com.aliyilmaz.entities.Kullanici;
import com.aliyilmaz.exception.ResourceNotFoundException;
import com.aliyilmaz.repository.KullaniciRepository;
import com.aliyilmaz.services.IChatbotServices;

@Service
public class ChatbotServices implements IChatbotServices {

	private final KullaniciRepository kullaniciRepository;
	private final MenuDiscoveryService menuDiscovery;
	private final MenuContextBuilder menuContextBuilder;
	private final GroqAssistantService groq;
	private final UrunOneriHelper oneriHelper;

	public ChatbotServices(KullaniciRepository kullaniciRepository,
			MenuDiscoveryService menuDiscovery,
			MenuContextBuilder menuContextBuilder,
			GroqAssistantService groq,
			UrunOneriHelper oneriHelper) {
		this.kullaniciRepository = kullaniciRepository;
		this.menuDiscovery = menuDiscovery;
		this.menuContextBuilder = menuContextBuilder;
		this.groq = groq;
		this.oneriHelper = oneriHelper;
	}

	@Override
	@Transactional(readOnly = true)
	public DtoChatYanit chat(String email, DtoChatIstek istek) {
		Kullanici kullanici = kullaniciRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));

		List<DtoMenu> menuler = menuDiscovery.menuleriYukle(
				istek.getRestoranId(), istek.getEnlem(), istek.getBoylam(), istek.getYaricapKm());

		if (menuler.isEmpty()) {
			DtoChatYanit bos = new DtoChatYanit();
			bos.setYanitMetni("Şu an görüntülenecek menü bulunamadı.");
			bos.setKriterDegistirmeOnerisi("Konum iznini kontrol edin veya farklı bir restoran seçin.");
			return bos;
		}

		StructuredQueryParser.ParsedQuery parsed;
		try {
			parsed = groq.sorguAyristir(istek.getMesaj());
		} catch (Exception e) {
			parsed = StructuredQueryParser.ParsedQuery.empty();
		}
		Set<Integer> haric = istek.getHaricTutUrunIds() == null
				? Set.of()
				: new HashSet<>(istek.getHaricTutUrunIds());
		StructuredQueryParser.ParsedQuery parsedZengin = zenginlestirParsed(parsed, istek.getMesaj());
		List<DtoOnerilenUrun> oneriler = oneriHelper.filtreleVeSirala(menuler, kullanici, parsedZengin, null, haric);

		String menuBaglami = menuContextBuilder.build(menuler);
		String sistemEk = "Kullanıcı tercihleri: " + oneriHelper.tercihOzeti(kullanici);

		String yanitMetni;
		if (oneriler.isEmpty()) {
			yanitMetni = "Kriterlerinize uygun ürün bulunamadı. Bütçenizi artırmayı veya farklı bir yemek türü denemeyi düşünebilirsiniz.";
		} else {
			String urunOzet = oneriler.stream()
					.map(o -> o.getUrunAdi() + " (" + o.getRestoranAdi() + ", " + o.getFiyat() + " TL)")
					.collect(Collectors.joining("; "));
			try {
				yanitMetni = groq.chatYanitiUret(sistemEk, istek.getMesaj(), menuBaglami + "\nÖnerilen: " + urunOzet);
			} catch (Exception e) {
				yanitMetni = "Size uygun gördüğümüz seçenekler:\n"
						+ oneriler.stream()
								.limit(8)
								.map(o -> "• " + o.getUrunAdi() + " — " + o.getRestoranAdi() + " (" + o.getFiyat() + " TL)")
								.collect(Collectors.joining("\n"))
						+ "\n\n(GROQ_API_KEY tanımlı değil; kısa liste modu.)";
			}
		}

		DtoChatYanit yanit = new DtoChatYanit();
		yanit.setYanitMetni(yanitMetni);
		yanit.setOnerilenUrunler(oneriler);
		yanit.setUyariMesaji(oneriHelper.alerjenUyari(kullanici));
		if (oneriler.isEmpty()) {
			yanit.setKriterDegistirmeOnerisi(
					"Bütçe veya tercih kriterlerinizi gevşeterek tekrar deneyebilirsiniz.");
		}
		return yanit;
	}

	private static final Pattern BUTCE_PATTERN =
			Pattern.compile("(\\d+)\\s*tl", Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);

	private StructuredQueryParser.ParsedQuery zenginlestirParsed(
			StructuredQueryParser.ParsedQuery parsed,
			String mesaj) {
		if (mesaj == null || mesaj.isBlank()) {
			return parsed;
		}
		String m = mesaj.toLowerCase(Locale.forLanguageTag("tr"));
		List<String> kelimeler = new ArrayList<>(parsed.anahtarKelimeler());
		String[] ipuclari = {
				"vegan", "vejetaryen", "helal", "köfte", "kofte", "kebap", "pide", "lahmacun",
				"iskender", "döner", "doner", "pizza", "burger", "balık", "balik", "çorba", "corba",
				"tost", "kahvaltı", "kahvalti", "tatlı", "tatli", "waffle", "mantı", "manti", "salata"
		};
		for (String ipucu : ipuclari) {
			if (m.contains(ipucu) && !kelimeler.contains(ipucu)) {
				kelimeler.add(ipucu);
			}
		}
		BigDecimal butce = parsed.butceMax();
		if (butce == null) {
			Matcher matcher = BUTCE_PATTERN.matcher(m);
			if (matcher.find()) {
				butce = new BigDecimal(matcher.group(1));
			}
		}
		if (m.contains("altı") || m.contains("alti") || m.contains("ucuz")) {
			if (butce == null && kelimeler.stream().noneMatch(k -> k.matches("\\d+"))) {
				butce = new BigDecimal("250");
			}
		}
		return new StructuredQueryParser.ParsedQuery(
				butce,
				kelimeler,
				parsed.kacinilacakAlerjenler(),
				parsed.aciklama());
	}
}
