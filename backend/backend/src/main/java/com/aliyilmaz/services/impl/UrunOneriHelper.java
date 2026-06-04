package com.aliyilmaz.services.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.aliyilmaz.ai.PreferenceScoringService;
import com.aliyilmaz.ai.StructuredQueryParser;
import com.aliyilmaz.dto.DtoKategori;
import com.aliyilmaz.dto.DtoMenu;
import com.aliyilmaz.dto.DtoOnerilenUrun;
import com.aliyilmaz.dto.DtoTercih;
import com.aliyilmaz.dto.DtoUrun;
import com.aliyilmaz.entities.Kullanici;

@Component
public class UrunOneriHelper {

	private static final int SONUC_LIMITI = 6;
	private static final int HARIC_TUT_LIMITI = 10;

	private static final Map<String, List<String>> KELIME_ESANLAM =
			Map.ofEntries(
					Map.entry("vegan", List.of("vegan", "falafel", "humus", "quinoa", "sebze", "smoothie", "detoks")),
					Map.entry("vejetaryen", List.of("vejetaryen", "falafel", "humus", "peynir", "salata", "mantı")),
					Map.entry("helal", List.of("kebap", "köfte", "kofte", "döner", "doner", "pide", "lahmacun", "iskender")),
					Map.entry("sağlıklı", List.of("salata", "bowl", "smoothie", "çorba", "corba", "sebze", "piyaz", "detoks")),
					Map.entry("saglikli", List.of("salata", "bowl", "smoothie", "çorba", "corba", "sebze", "piyaz", "detoks")),
					Map.entry("düşük", List.of("salata", "çorba", "corba", "ayran", "çay", "cay", "smoothie")),
					Map.entry("dusuk", List.of("salata", "çorba", "corba", "ayran", "çay", "cay", "smoothie")),
					Map.entry("kalori", List.of("salata", "çorba", "corba", "bowl", "smoothie")),
					Map.entry("köfte", List.of("köfte", "kofte", "kebap")),
					Map.entry("kofte", List.of("köfte", "kofte", "kebap")),
					Map.entry("kebap", List.of("kebap", "iskender", "döner", "doner", "adana", "urfa")),
					Map.entry("pide", List.of("pide", "lahmacun")),
					Map.entry("pizza", List.of("pizza")),
					Map.entry("burger", List.of("burger")),
					Map.entry("balık", List.of("balık", "balik", "levrek", "hamsi")),
					Map.entry("balik", List.of("balık", "balik", "levrek", "hamsi")),
					Map.entry("kahvaltı", List.of("kahvaltı", "kahvalti", "menemen", "simit")),
					Map.entry("kahvalti", List.of("kahvaltı", "kahvalti", "menemen", "simit")),
					Map.entry("tatlı", List.of("tatlı", "tatli", "künefe", "kunefe", "helva", "waffle")),
					Map.entry("tatli", List.of("tatlı", "tatli", "künefe", "kunefe", "helva", "waffle")),
					Map.entry("çorba", List.of("çorba", "corba", "mercimek", "işkembe", "iskembe")),
					Map.entry("corba", List.of("çorba", "corba", "mercimek", "işkembe", "iskembe")),
					Map.entry("tost", List.of("tost")),
					Map.entry("iskender", List.of("iskender")),
					Map.entry("döner", List.of("döner", "doner")),
					Map.entry("doner", List.of("döner", "doner")));

	private final PreferenceScoringService scoringService;

	public UrunOneriHelper(PreferenceScoringService scoringService) {
		this.scoringService = scoringService;
	}

	public List<DtoOnerilenUrun> filtreleVeSirala(
			List<DtoMenu> menuler,
			Kullanici kullanici,
			StructuredQueryParser.ParsedQuery parsed,
			BigDecimal butceOverride) {
		return filtreleVeSirala(menuler, kullanici, parsed, butceOverride, Set.of());
	}

	public List<DtoOnerilenUrun> filtreleVeSirala(
			List<DtoMenu> menuler,
			Kullanici kullanici,
			StructuredQueryParser.ParsedQuery parsed,
			BigDecimal butceOverride,
			Set<Integer> haricTutUrunIds) {

		Set<Integer> haric = sinirliHaricTut(haricTutUrunIds);
		List<String> anahtarlar = genisletilmisAnahtarlar(parsed.anahtarKelimeler());
		boolean anahtarZorunlu = menuAnahtarEslesiyorMu(menuler, anahtarlar);

		List<DtoOnerilenUrun> sonuc = adaylariTopla(
				menuler, kullanici, parsed, butceOverride, haric, anahtarlar, anahtarZorunlu, 1);

		if (sonuc.isEmpty()) {
			sonuc = adaylariTopla(
					menuler, kullanici, parsed, butceOverride, haric, anahtarlar, false, 1);
		}
		if (sonuc.isEmpty()) {
			BigDecimal gevsekButce = gevsekButce(parsed, butceOverride, kullanici);
			sonuc = adaylariTopla(
					menuler, kullanici, parsed, gevsekButce, haric, List.of(), false, 0);
		}
		if (sonuc.isEmpty() && !haric.isEmpty()) {
			sonuc = adaylariTopla(
					menuler, kullanici, parsed, gevsekButce(parsed, butceOverride, kullanici),
					Set.of(), List.of(), false, 0);
		}

		sonuc.sort(Comparator.comparingInt(DtoOnerilenUrun::getUygunlukSkoru).reversed());
		return sonuc.size() > SONUC_LIMITI ? sonuc.subList(0, SONUC_LIMITI) : sonuc;
	}

	private List<DtoOnerilenUrun> adaylariTopla(
			List<DtoMenu> menuler,
			Kullanici kullanici,
			StructuredQueryParser.ParsedQuery parsed,
			BigDecimal butceOverride,
			Set<Integer> haricTutUrunIds,
			List<String> anahtarlar,
			boolean anahtarZorunlu,
			int minSkor) {

		DtoTercih tercih = scoringService.tercihFrom(kullanici);
		BigDecimal butce = butceOverride != null ? butceOverride
				: (parsed.butceMax() != null ? parsed.butceMax() : tercih.getButce());

		List<DtoOnerilenUrun> adaylar = new ArrayList<>();
		for (DtoMenu menu : menuler) {
			if (menu.getKategoriler() == null) {
				continue;
			}
			for (DtoKategori kat : menu.getKategoriler()) {
				if (kat.getUrunler() == null) {
					continue;
				}
				for (DtoUrun u : kat.getUrunler()) {
					if (!u.isMevcut()) {
						continue;
					}
					if (haricTutUrunIds.contains(u.getId())) {
						continue;
					}
					if (anahtarZorunlu && !urunAnahtarEslesiyor(u, anahtarlar)) {
						continue;
					}
					int skor = scoringService.skorHesapla(tercih, u, butce);
					if (anahtarZorunlu && urunAnahtarEslesiyor(u, anahtarlar)) {
						skor += 15;
					}
					if (skor < minSkor) {
						continue;
					}
					adaylar.add(urundenOneri(menu, u, skor));
				}
			}
		}
		return adaylar;
	}

	private DtoOnerilenUrun urundenOneri(DtoMenu menu, DtoUrun u, int skor) {
		DtoOnerilenUrun o = new DtoOnerilenUrun();
		o.setUrunId(u.getId());
		o.setRestoranId(menu.getRestoran().getId());
		o.setRestoranAdi(menu.getRestoran().getRestoranAdi());
		o.setUrunAdi(u.getUrunAdi());
		o.setFiyat(u.getFiyat());
		o.setTahminiKalori(u.getTahminiKalori());
		o.setMesafeKm(menu.getRestoran().getMesafeKm());
		o.setUygunlukSkoru(skor);
		o.setUygunluk(scoringService.uygunlukEtiketi(skor));
		return o;
	}

	private Set<Integer> sinirliHaricTut(Set<Integer> haricTutUrunIds) {
		if (haricTutUrunIds == null || haricTutUrunIds.isEmpty()) {
			return Set.of();
		}
		List<Integer> liste = new ArrayList<>(haricTutUrunIds);
		int baslangic = Math.max(0, liste.size() - HARIC_TUT_LIMITI);
		return new HashSet<>(liste.subList(baslangic, liste.size()));
	}

	private BigDecimal gevsekButce(
			StructuredQueryParser.ParsedQuery parsed,
			BigDecimal butceOverride,
			Kullanici kullanici) {
		BigDecimal butce = butceOverride != null ? butceOverride
				: (parsed.butceMax() != null ? parsed.butceMax() : kullanici.getButce());
		if (butce == null) {
			return null;
		}
		return butce.multiply(BigDecimal.valueOf(1.8)).setScale(0, RoundingMode.CEILING);
	}

	private List<String> genisletilmisAnahtarlar(List<String> kelimeler) {
		Set<String> sonuc = new LinkedHashSet<>();
		if (kelimeler == null) {
			return List.of();
		}
		for (String k : kelimeler) {
			if (k == null || k.isBlank()) {
				continue;
			}
			String norm = k.toLowerCase(Locale.forLanguageTag("tr")).trim();
			sonuc.add(norm);
			KELIME_ESANLAM.forEach((anahtar, esanlamlar) -> {
				if (norm.contains(anahtar) || anahtar.contains(norm)) {
					sonuc.addAll(esanlamlar);
				}
			});
		}
		return new ArrayList<>(sonuc);
	}

	private boolean menuAnahtarEslesiyorMu(List<DtoMenu> menuler, List<String> anahtarlar) {
		if (anahtarlar.isEmpty()) {
			return false;
		}
		for (DtoMenu menu : menuler) {
			if (menu.getKategoriler() == null) {
				continue;
			}
			for (DtoKategori kat : menu.getKategoriler()) {
				if (kat.getUrunler() == null) {
					continue;
				}
				for (DtoUrun u : kat.getUrunler()) {
					if (urunAnahtarEslesiyor(u, anahtarlar)) {
						return true;
					}
				}
			}
		}
		return false;
	}

	private boolean urunAnahtarEslesiyor(DtoUrun u, List<String> anahtarlar) {
		if (anahtarlar.isEmpty()) {
			return true;
		}
		String metin = (u.getUrunAdi() + " " + (u.getAciklama() == null ? "" : u.getAciklama()))
				.toLowerCase(Locale.forLanguageTag("tr"));
		for (String k : anahtarlar) {
			if (k != null && !k.isBlank() && metin.contains(k)) {
				return true;
			}
		}
		return false;
	}

	public String tercihOzeti(Kullanici k) {
		StringBuilder sb = new StringBuilder();
		if (k.getButce() != null) {
			sb.append("Bütçe: ").append(k.getButce()).append(" TL. ");
		}
		if (k.isGlutensiz()) {
			sb.append("Glutensiz. ");
		}
		if (k.isVegan()) {
			sb.append("Vegan. ");
		}
		if (k.getAlerjenler() != null && !k.getAlerjenler().isEmpty()) {
			sb.append("Kaçınılan alerjenler: ").append(String.join(", ", k.getAlerjenler()));
		}
		return sb.toString().trim();
	}

	public String alerjenUyari(Kullanici k) {
		if (k.getAlerjenler() != null && !k.getAlerjenler().isEmpty()) {
			return "Alerjen veya beslenme hassasiyetiniz için sipariş öncesinde işletmeden doğrulama yapmanız önerilir.";
		}
		if (k.isGlutensiz()) {
			return "Glutensiz seçenekler bulunabilir; ciddi hassasiyet durumlarında işletmeden doğrulama yapılması önerilir.";
		}
		return null;
	}
}
