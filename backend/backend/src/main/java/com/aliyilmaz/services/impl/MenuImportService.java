package com.aliyilmaz.services.impl;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aliyilmaz.dto.DtoKategoriIU;
import com.aliyilmaz.dto.DtoUrunIU;
import com.aliyilmaz.entities.Kategori;
import com.aliyilmaz.entities.Restoran;
import com.aliyilmaz.exception.MenuVerisiErisilemediException;
import com.aliyilmaz.repository.AppRepository;
import com.aliyilmaz.repository.KategoriRepository;
import com.aliyilmaz.services.IMenuServices;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class MenuImportService {

	private final AppRepository appRepository;
	private final KategoriRepository kategoriRepository;
	private final IMenuServices menuServices;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@Value("${pickabite.menu.import.path:../menu/menu.json}")
	private String importPath;

	public MenuImportService(AppRepository appRepository,
			KategoriRepository kategoriRepository,
			IMenuServices menuServices) {
		this.appRepository = appRepository;
		this.kategoriRepository = kategoriRepository;
		this.menuServices = menuServices;
	}

	@Scheduled(cron = "${pickabite.menu.sync.cron:0 0 3 * * *}")
	@Transactional
	public void zamanlanmisSenkron() {
		try {
			menuJsonSenkron();
		} catch (Exception ignored) {
			// Dosya yoksa zamanlanmış görev sessizce atlanır
		}
	}

	@Transactional
	public int menuJsonSenkron() {
		Path path = Path.of(importPath).toAbsolutePath().normalize();
		if (!Files.exists(path)) {
			throw new MenuVerisiErisilemediException(
					"Menü verisine erişilemedi. Kaynak dosya bulunamadı: " + path);
		}

		try {
			JsonNode root = objectMapper.readTree(Files.readString(path));
			String restoranAdi = root.has("restoran_adi")
					? root.get("restoran_adi").asText()
					: "İçe Aktarılan Restoran";

			Restoran restoran = appRepository.findAll().stream()
					.filter(r -> r.getRestoranAdi().equalsIgnoreCase(restoranAdi))
					.findFirst()
					.orElseGet(() -> {
						Restoran yeni = new Restoran();
						yeni.setRestoranAdi(restoranAdi);
						yeni.setEnlem(41.015137);
						yeni.setBoylam(28.97953);
						yeni.setAdres("İçe aktarım");
						if (root.has("kaynak_url")) {
							yeni.setAciklama(root.get("kaynak_url").asText());
						}
						return appRepository.save(yeni);
					});

			int sira = 1;
			int urunSayisi = 0;
			if (root.has("kategoriler") && root.get("kategoriler").isArray()) {
				for (JsonNode katNode : root.get("kategoriler")) {
					String katAdi = katNode.get("kategori").asText();
					final Restoran restoranRef = restoran;
					final int siraNo = sira;
					Kategori kategori = kategoriRepository.findByRestoranIdOrderBySiraNoAsc(restoran.getId()).stream()
							.filter(k -> k.getKategoriAdi().equalsIgnoreCase(katAdi))
							.findFirst()
							.orElseGet(() -> {
								DtoKategoriIU katIu = new DtoKategoriIU();
								katIu.setKategoriAdi(katAdi);
								katIu.setSiraNo(siraNo);
								var dtoKat = menuServices.kategoriOlustur(restoranRef.getId(), katIu);
								return kategoriRepository.findById(dtoKat.getId()).orElseThrow();
							});

					if (katNode.has("urunler") && katNode.get("urunler").isArray()) {
						for (JsonNode urunNode : katNode.get("urunler")) {
							String ad = urunNode.get("ad").asText();
							BigDecimal fiyat = BigDecimal.valueOf(urunNode.get("fiyat").asDouble());

							boolean exists = kategori.getUrunler().stream()
									.anyMatch(u -> u.getUrunAdi().equalsIgnoreCase(ad));
							if (!exists) {
								DtoUrunIU urunIu = new DtoUrunIU();
								urunIu.setUrunAdi(ad);
								urunIu.setFiyat(fiyat);
								if (katNode.has("aciklama")) {
									urunIu.setAciklama(katNode.get("aciklama").asText());
								}
								urunIu.setAlerjenler(new HashSet<>());
								urunIu.setMevcut(true);
								menuServices.urunOlustur(kategori.getId(), urunIu);
								urunSayisi++;
							}
						}
					}
					sira++;
				}
			}
			return urunSayisi;
		} catch (MenuVerisiErisilemediException e) {
			throw e;
		} catch (Exception e) {
			throw new MenuVerisiErisilemediException("Menü verisi işlenirken hata oluştu: " + e.getMessage());
		}
	}
}
