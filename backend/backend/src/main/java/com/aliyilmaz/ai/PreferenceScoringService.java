package com.aliyilmaz.ai;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.aliyilmaz.dto.DtoTercih;
import com.aliyilmaz.dto.DtoUrun;
import com.aliyilmaz.entities.Kullanici;

@Service
public class PreferenceScoringService {

	public static final String UYGUNLUK_YUKSEK = "yuksek";
	public static final String UYGUNLUK_ORTA = "orta";
	public static final String UYGUNLUK_DUSUK = "dusuk";

	public int skorHesapla(Kullanici kullanici, DtoUrun urun) {
		return skorHesapla(tercihFrom(kullanici), urun, null);
	}

	public int skorHesapla(DtoTercih tercih, DtoUrun urun, BigDecimal butceMax) {
		int skor = 50;
		if (urun == null || !urun.isMevcut()) {
			return 0;
		}

		BigDecimal butce = butceMax != null ? butceMax : tercih.getButce();
		if (butce != null && urun.getFiyat() != null && urun.getFiyat().compareTo(butce) > 0) {
			double oran = urun.getFiyat().doubleValue() / butce.doubleValue();
			if (oran > 2.5) {
				return 0;
			}
			skor -= (int) Math.min(45, (oran - 1.0) * 35);
		}

		if (tercih.getAlerjenler() != null && urun.getAlerjenler() != null) {
			for (String alerjen : tercih.getAlerjenler()) {
				if (containsIgnoreCase(urun.getAlerjenler(), alerjen)) {
					return 0;
				}
			}
		}

		String ad = (urun.getUrunAdi() + " " + (urun.getAciklama() == null ? "" : urun.getAciklama()))
				.toLowerCase(Locale.forLanguageTag("tr"));

		if (tercih.isVegan() && containsAny(ad, "tavuk", "et", "balik", "köfte", "kofte", "sucuk", "peynir", "süt", "sut")) {
			skor -= 30;
		}
		if (tercih.isVejetaryen() && containsAny(ad, "tavuk", "et", "balik", "köfte", "kofte", "sucuk")) {
			skor -= 25;
		}
		if (tercih.isGlutensiz() && (containsAny(ad, "ekmek", "bulgur", "makarna", "un") || containsIgnoreCase(urun.getAlerjenler(), "gluten"))) {
			skor -= 35;
		}
		if (tercih.isLaktozsuz() && (containsAny(ad, "peynir", "süt", "sut", "yoğurt", "yogurt", "kaymak")
				|| containsIgnoreCase(urun.getAlerjenler(), "sut"))) {
			skor -= 25;
		}
		if (tercih.isHelal() && containsAny(ad, "domuz", "alkol", "şarap", "sarap", "bira")) {
			skor -= 40;
		}

		if (butce != null && urun.getFiyat() != null) {
			double oran = urun.getFiyat().doubleValue() / butce.doubleValue();
			if (oran <= 0.7) {
				skor += 15;
			}
		}

		return Math.max(0, Math.min(100, skor));
	}

	public String uygunlukEtiketi(int skor) {
		if (skor >= 70) {
			return UYGUNLUK_YUKSEK;
		}
		if (skor >= 40) {
			return UYGUNLUK_ORTA;
		}
		return UYGUNLUK_DUSUK;
	}

	public int restoranUygunlukSkoru(Kullanici kullanici, int uyumluUrunSayisi, int toplamUrun) {
		if (toplamUrun == 0) {
			return 0;
		}
		int oran = (uyumluUrunSayisi * 100) / toplamUrun;
		if (kullanici.isGlutensiz() && uyumluUrunSayisi > 0) {
			oran += 10;
		}
		return Math.min(100, oran);
	}

	public DtoTercih tercihFrom(Kullanici k) {
		DtoTercih t = new DtoTercih();
		t.setButce(k.getButce());
		t.setVegan(k.isVegan());
		t.setVejetaryen(k.isVejetaryen());
		t.setGlutensiz(k.isGlutensiz());
		t.setHelal(k.isHelal());
		t.setLaktozsuz(k.isLaktozsuz());
		t.setAlerjenler(k.getAlerjenler());
		return t;
	}

	private boolean containsIgnoreCase(Set<String> set, String value) {
		if (set == null || value == null) {
			return false;
		}
		String v = value.toLowerCase(Locale.forLanguageTag("tr"));
		return set.stream().anyMatch(s -> s != null && s.toLowerCase(Locale.forLanguageTag("tr")).contains(v)
				|| v.contains(s.toLowerCase(Locale.forLanguageTag("tr"))));
	}

	private boolean containsAny(String text, String... keywords) {
		for (String kw : keywords) {
			if (text.contains(kw)) {
				return true;
			}
		}
		return false;
	}
}
