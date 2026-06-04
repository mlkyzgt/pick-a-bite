package com.aliyilmaz.starter;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Iterator;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.aliyilmaz.dto.DtoKategoriIU;
import com.aliyilmaz.dto.DtoUrunIU;
import com.aliyilmaz.entities.Kategori;
import com.aliyilmaz.entities.Restoran;
import com.aliyilmaz.repository.AppRepository;
import com.aliyilmaz.repository.KategoriRepository;
import com.aliyilmaz.services.IMenuServices;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Bursa Mimar Sinan çevresi demo restoran ve menülerini yükler (idempotent).
 */
@Component
public class DemoDataSeeder implements ApplicationRunner {

	private final AppRepository appRepository;
	private final KategoriRepository kategoriRepository;
	private final IMenuServices menuServices;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@Value("${pickabite.demo.seed.enabled:true}")
	private boolean seedEnabled;

	@Value("${pickabite.demo.seed.path:classpath:seed/bursa-mimar-sinan.json}")
	private String seedPath;

	public DemoDataSeeder(AppRepository appRepository,
			KategoriRepository kategoriRepository,
			IMenuServices menuServices) {
		this.appRepository = appRepository;
		this.kategoriRepository = kategoriRepository;
		this.menuServices = menuServices;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		if (!seedEnabled) {
			return;
		}
		try (InputStream in = new ClassPathResource(resolveClasspath(seedPath)).getInputStream()) {
			JsonNode root = objectMapper.readTree(in);
			if (!root.has("restoranlar") || !root.get("restoranlar").isArray()) {
				return;
			}
			int eklenen = 0;
			for (JsonNode rNode : root.get("restoranlar")) {
				if (seedRestoran(rNode)) {
					eklenen++;
				}
			}
			if (eklenen > 0) {
				System.out.println("[DemoDataSeeder] " + eklenen + " demo restoran/menü yüklendi (Bursa Mimar Sinan).");
			}
		} catch (Exception e) {
			System.err.println("[DemoDataSeeder] Demo veri yüklenemedi: " + e.getMessage());
		}
	}

	private boolean seedRestoran(JsonNode rNode) {
		String ad = rNode.get("restoran_adi").asText();
		String qrKod = rNode.has("qr_kod") ? rNode.get("qr_kod").asText() : null;

		if (qrKod != null && appRepository.findByQrKod(qrKod).isPresent()) {
			return false;
		}

		Restoran restoran = new Restoran();
		restoran.setRestoranAdi(ad);
		restoran.setEnlem(rNode.get("enlem").asDouble());
		restoran.setBoylam(rNode.get("boylam").asDouble());
		if (rNode.has("adres")) {
			restoran.setAdres(rNode.get("adres").asText());
		}
		if (rNode.has("aciklama")) {
			restoran.setAciklama(rNode.get("aciklama").asText());
		}
		if (qrKod != null) {
			restoran.setQrKod(qrKod);
		}
		restoran = appRepository.save(restoran);

		if (!rNode.has("kategoriler")) {
			return true;
		}

		int sira = 1;
		for (JsonNode katNode : rNode.get("kategoriler")) {
			String katAdi = katNode.get("kategori").asText();
			int siraNo = katNode.has("sira_no") ? katNode.get("sira_no").asInt() : sira;
			final Restoran restoranRef = restoran;
			final int siraNoFinal = siraNo;

			Kategori kategori = kategoriRepository.findByRestoranIdOrderBySiraNoAsc(restoran.getId()).stream()
					.filter(k -> k.getKategoriAdi().equalsIgnoreCase(katAdi))
					.findFirst()
					.orElseGet(() -> {
						DtoKategoriIU katIu = new DtoKategoriIU();
						katIu.setKategoriAdi(katAdi);
						katIu.setSiraNo(siraNoFinal);
						var dtoKat = menuServices.kategoriOlustur(restoranRef.getId(), katIu);
						return kategoriRepository.findById(dtoKat.getId()).orElseThrow();
					});

			if (katNode.has("urunler") && katNode.get("urunler").isArray()) {
				for (JsonNode urunNode : katNode.get("urunler")) {
					String urunAdi = urunNode.get("ad").asText();
					boolean exists = kategori.getUrunler().stream()
							.anyMatch(u -> u.getUrunAdi().equalsIgnoreCase(urunAdi));
					if (exists) {
						continue;
					}
					DtoUrunIU urunIu = new DtoUrunIU();
					urunIu.setUrunAdi(urunAdi);
					urunIu.setFiyat(BigDecimal.valueOf(urunNode.get("fiyat").asDouble()));
					urunIu.setMevcut(true);
					urunIu.setAlerjenler(new HashSet<>());
					if (urunNode.has("alerjenler") && urunNode.get("alerjenler").isArray()) {
						Iterator<JsonNode> it = urunNode.get("alerjenler").elements();
						while (it.hasNext()) {
							urunIu.getAlerjenler().add(it.next().asText());
						}
					}
					if (urunNode.has("kalori")) {
						urunIu.setTahminiKalori(urunNode.get("kalori").asInt());
					}
					if (urunNode.has("protein")) {
						urunIu.setTahminiProtein(urunNode.get("protein").asInt());
					}
					if (urunNode.has("karbonhidrat")) {
						urunIu.setTahminiKarbonhidrat(urunNode.get("karbonhidrat").asInt());
					}
					if (urunNode.has("yag")) {
						urunIu.setTahminiYag(urunNode.get("yag").asInt());
					}
					menuServices.urunOlustur(kategori.getId(), urunIu);
				}
			}
			sira++;
		}
		return true;
	}

	private static String resolveClasspath(String path) {
		if (path.startsWith("classpath:")) {
			return path.substring("classpath:".length());
		}
		return path;
	}
}
