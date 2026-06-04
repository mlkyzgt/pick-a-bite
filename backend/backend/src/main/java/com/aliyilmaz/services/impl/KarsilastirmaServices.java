package com.aliyilmaz.services.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aliyilmaz.ai.GroqAssistantService;
import com.aliyilmaz.ai.StructuredQueryParser;
import com.aliyilmaz.dto.DtoKarsilastirmaIstek;
import com.aliyilmaz.dto.DtoKarsilastirmaOge;
import com.aliyilmaz.dto.DtoKarsilastirmaYanit;
import com.aliyilmaz.dto.DtoMenu;
import com.aliyilmaz.dto.DtoOnerilenUrun;
import com.aliyilmaz.entities.Kullanici;
import com.aliyilmaz.exception.BusinessException;
import com.aliyilmaz.exception.ResourceNotFoundException;
import com.aliyilmaz.repository.KullaniciRepository;
import com.aliyilmaz.services.IAppServices;
import com.aliyilmaz.services.IKarsilastirmaServices;

@Service
public class KarsilastirmaServices implements IKarsilastirmaServices {

	private final KullaniciRepository kullaniciRepository;
	private final IAppServices appServices;
	private final MenuDiscoveryService menuDiscovery;
	private final GroqAssistantService groq;
	private final UrunOneriHelper oneriHelper;

	public KarsilastirmaServices(KullaniciRepository kullaniciRepository,
			IAppServices appServices,
			MenuDiscoveryService menuDiscovery,
			GroqAssistantService groq,
			UrunOneriHelper oneriHelper) {
		this.kullaniciRepository = kullaniciRepository;
		this.appServices = appServices;
		this.menuDiscovery = menuDiscovery;
		this.groq = groq;
		this.oneriHelper = oneriHelper;
	}

	@Override
	@Transactional(readOnly = true)
	public DtoKarsilastirmaYanit karsilastir(String email, double enlem, double boylam,
			Double yaricapKm, BigDecimal butceMax) {
		Kullanici kullanici = kullaniciRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));

		double yaricap = (yaricapKm == null || yaricapKm <= 0) ? 5.0 : yaricapKm;
		List<DtoMenu> menuler = new ArrayList<>();
		var restoranlar = appServices.yakindakiRestoranlar(enlem, boylam, yaricap, email);
		for (var r : restoranlar) {
			menuler.add(menuDiscovery.menuleriYukle(r.getId(), null, null, null).get(0));
		}

		StructuredQueryParser.ParsedQuery parsed = StructuredQueryParser.ParsedQuery.empty();
		if (butceMax != null) {
			parsed = new StructuredQueryParser.ParsedQuery(butceMax, List.of(), Set.of(), "");
		}

		return sonucOlustur(kullanici, menuler, parsed, butceMax);
	}

	@Override
	@Transactional(readOnly = true)
	public DtoKarsilastirmaYanit karsilastir(String email, DtoKarsilastirmaIstek istek) {
		if (istek.getEnlem() == null || istek.getBoylam() == null) {
			throw new BusinessException("Karşılaştırma için konum bilgisi (enlem, boylam) gereklidir.");
		}

		Kullanici kullanici = kullaniciRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));

		StructuredQueryParser.ParsedQuery parsed = StructuredQueryParser.ParsedQuery.empty();
		BigDecimal butce = istek.getButceMax();
		if (istek.getMesaj() != null && !istek.getMesaj().isBlank()) {
			parsed = groq.sorguAyristir(istek.getMesaj());
			if (parsed.butceMax() != null) {
				butce = parsed.butceMax();
			}
		}

		double yaricap = (istek.getYaricapKm() == null || istek.getYaricapKm() <= 0) ? 5.0 : istek.getYaricapKm();
		List<DtoMenu> menuler = menuDiscovery.menuleriYukle(null, istek.getEnlem(), istek.getBoylam(), yaricap);

		return sonucOlustur(kullanici, menuler, parsed, butce);
	}

	private DtoKarsilastirmaYanit sonucOlustur(Kullanici kullanici, List<DtoMenu> menuler,
			StructuredQueryParser.ParsedQuery parsed, BigDecimal butceMax) {

		List<DtoOnerilenUrun> oneriler = oneriHelper.filtreleVeSirala(menuler, kullanici, parsed, butceMax);

		Set<Integer> restoranIdSet = new HashSet<>();
		List<DtoKarsilastirmaOge> sonuclar = new ArrayList<>();
		for (DtoOnerilenUrun o : oneriler) {
			restoranIdSet.add(o.getRestoranId());
			DtoKarsilastirmaOge oge = new DtoKarsilastirmaOge();
			oge.setRestoranAdi(o.getRestoranAdi());
			oge.setRestoranId(o.getRestoranId());
			oge.setUrunAdi(o.getUrunAdi());
			oge.setUrunId(o.getUrunId());
			oge.setFiyat(o.getFiyat());
			oge.setMesafeKm(o.getMesafeKm());
			oge.setUygunluk(o.getUygunluk());
			oge.setUygunlukSkoru(o.getUygunlukSkoru());
			sonuclar.add(oge);
		}

		sonuclar.sort(Comparator.comparingInt(DtoKarsilastirmaOge::getUygunlukSkoru).reversed());

		DtoKarsilastirmaYanit yanit = new DtoKarsilastirmaYanit();
		yanit.setSonuclar(sonuclar);

		if (restoranIdSet.size() < 2 && !sonuclar.isEmpty()) {
			yanit.setMesaj("Yakınınızda karşılaştırma için yeterli restoran çeşitliliği bulunamadı.");
		} else if (sonuclar.isEmpty()) {
			yanit.setMesaj("Kriterlerinize uygun ürün bulunamadı. Bütçe veya tercihlerinizi güncelleyerek tekrar deneyin.");
		} else {
			yanit.setMesaj(restoranIdSet.size() + " restorandan " + sonuclar.size() + " uygun seçenek listelendi.");
		}
		return yanit;
	}
}
