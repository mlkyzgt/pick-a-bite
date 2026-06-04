package com.aliyilmaz.services.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aliyilmaz.ai.AiPromptTemplates;
import com.aliyilmaz.ai.GroqAssistantService;
import com.aliyilmaz.ai.StructuredQueryParser;
import com.aliyilmaz.dto.DtoUrun;
import com.aliyilmaz.entities.Urun;
import com.aliyilmaz.exception.BusinessException;
import com.aliyilmaz.exception.ResourceNotFoundException;
import com.aliyilmaz.repository.KategoriRepository;
import com.aliyilmaz.repository.UrunRepository;
import com.aliyilmaz.services.IAiMenuServices;
import com.aliyilmaz.services.IMenuServices;

@Service
public class AiMenuServices implements IAiMenuServices {

	private final UrunRepository urunRepository;
	private final KategoriRepository kategoriRepository;
	private final GroqAssistantService groq;
	private final IMenuServices menuServices;

	public AiMenuServices(UrunRepository urunRepository,
			KategoriRepository kategoriRepository,
			GroqAssistantService groq,
			IMenuServices menuServices) {
		this.urunRepository = urunRepository;
		this.kategoriRepository = kategoriRepository;
		this.groq = groq;
		this.menuServices = menuServices;
	}

	@Override
	@Transactional
	public DtoUrun urunAiAnaliz(Integer urunId) {
		Urun u = urunRepository.findById(urunId)
				.orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + urunId));

		StructuredQueryParser.UrunAnalizSonuc sonuc = groq.urunAnalizEt(u.getUrunAdi(), u.getAciklama());
		if (sonuc == null) {
			throw new BusinessException("Ürün analizi tamamlanamadı. Lütfen tekrar deneyin.");
		}

		uygulaAnaliz(u, sonuc);
		u = urunRepository.save(u);
		return menuServices.urunGetir(u.getId());
	}

	@Override
	@Transactional
	public List<DtoUrun> restoranMenuAiAnaliz(Integer restoranId) {
		if (kategoriRepository.findByRestoranIdOrderBySiraNoAsc(restoranId).isEmpty()) {
			throw new ResourceNotFoundException("Restoran bulunamadı veya menüsü boş: " + restoranId);
		}

		List<DtoUrun> sonuclar = new ArrayList<>();
		var kategoriler = kategoriRepository.findByRestoranIdOrderBySiraNoAsc(restoranId);
		for (var k : kategoriler) {
			for (Urun u : k.getUrunler()) {
				if (u.isMevcut()) {
					sonuclar.add(urunAiAnaliz(u.getId()));
				}
			}
		}
		return sonuclar;
	}

	private void uygulaAnaliz(Urun u, StructuredQueryParser.UrunAnalizSonuc sonuc) {
		if (sonuc.tahminiKalori() != null) {
			u.setTahminiKalori(sonuc.tahminiKalori());
		}
		u.setTahminiProtein(sonuc.tahminiProtein());
		u.setTahminiKarbonhidrat(sonuc.tahminiKarbonhidrat());
		u.setTahminiYag(sonuc.tahminiYag());
		if (sonuc.alerjenler() != null && !sonuc.alerjenler().isEmpty()) {
			u.setAlerjenler(new HashSet<>(sonuc.alerjenler()));
		}
		u.setAiUretildi(true);
		u.setAiAnalizTarihi(LocalDateTime.now());
	}
}
