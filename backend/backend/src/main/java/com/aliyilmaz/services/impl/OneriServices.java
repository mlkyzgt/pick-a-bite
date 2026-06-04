package com.aliyilmaz.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aliyilmaz.ai.GroqAssistantService;
import com.aliyilmaz.ai.StructuredQueryParser;
import com.aliyilmaz.dto.DtoMenu;
import com.aliyilmaz.dto.DtoOneriIstek;
import com.aliyilmaz.dto.DtoOneriYanit;
import com.aliyilmaz.dto.DtoOnerilenUrun;
import com.aliyilmaz.entities.Kullanici;
import com.aliyilmaz.exception.BusinessException;
import com.aliyilmaz.exception.ResourceNotFoundException;
import com.aliyilmaz.repository.KullaniciRepository;
import com.aliyilmaz.services.IOneriServices;

@Service
public class OneriServices implements IOneriServices {

	private final KullaniciRepository kullaniciRepository;
	private final MenuDiscoveryService menuDiscovery;
	private final GroqAssistantService groq;
	private final UrunOneriHelper oneriHelper;

	public OneriServices(KullaniciRepository kullaniciRepository,
			MenuDiscoveryService menuDiscovery,
			GroqAssistantService groq,
			UrunOneriHelper oneriHelper) {
		this.kullaniciRepository = kullaniciRepository;
		this.menuDiscovery = menuDiscovery;
		this.groq = groq;
		this.oneriHelper = oneriHelper;
	}

	@Override
	@Transactional(readOnly = true)
	public DtoOneriYanit oneri(String email, DtoOneriIstek istek) {
		if (istek.getRestoranId() == null && (istek.getEnlem() == null || istek.getBoylam() == null)) {
			throw new BusinessException("restoranId veya enlem/boylam bilgisi gereklidir.");
		}

		Kullanici kullanici = kullaniciRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));

		List<DtoMenu> menuler = menuDiscovery.menuleriYukle(
				istek.getRestoranId(), istek.getEnlem(), istek.getBoylam(), istek.getYaricapKm());

		StructuredQueryParser.ParsedQuery parsed = StructuredQueryParser.ParsedQuery.empty();
		List<DtoOnerilenUrun> oneriler = oneriHelper.filtreleVeSirala(
				menuler, kullanici, parsed, istek.getButceMax());

		DtoOneriYanit yanit = new DtoOneriYanit();
		yanit.setOneriler(oneriler);
		yanit.setUyariMesaji(oneriHelper.alerjenUyari(kullanici));

		if (oneriler.isEmpty()) {
			yanit.setAciklama("Kriterlerinize uygun ürün bulunamadı.");
			yanit.setKriterDegistirmeOnerisi("Bütçenizi veya beslenme tercihlerinizi güncelleyerek tekrar deneyin.");
			return yanit;
		}

		String urunListesi = oneriler.stream()
				.map(o -> o.getUrunAdi() + " - " + o.getRestoranAdi() + " (" + o.getFiyat() + " TL)")
				.collect(Collectors.joining("\n"));
		try {
			yanit.setAciklama(groq.kisaOneriAciklamasi(oneriHelper.tercihOzeti(kullanici), urunListesi));
		} catch (Exception e) {
			yanit.setAciklama("Size uygun " + oneriler.size() + " seçenek bulundu.");
		}
		return yanit;
	}
}
