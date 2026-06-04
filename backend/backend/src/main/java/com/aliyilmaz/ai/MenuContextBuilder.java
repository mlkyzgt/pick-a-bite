package com.aliyilmaz.ai;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.aliyilmaz.dto.DtoKategori;
import com.aliyilmaz.dto.DtoMenu;
import com.aliyilmaz.dto.DtoRestoran;
import com.aliyilmaz.dto.DtoUrun;

@Component
public class MenuContextBuilder {

	private static final int MAX_URUN_PER_RESTORAN = 25;

	public String build(List<DtoMenu> menuler) {
		StringBuilder sb = new StringBuilder();
		for (DtoMenu menu : menuler) {
			sb.append(restoranBlok(menu));
			sb.append("\n");
		}
		return sb.toString();
	}

	public String build(DtoMenu menu) {
		return restoranBlok(menu);
	}

	private String restoranBlok(DtoMenu menu) {
		DtoRestoran r = menu.getRestoran();
		StringBuilder sb = new StringBuilder();
		sb.append("## Restoran: ").append(r.getRestoranAdi()).append(" (id=").append(r.getId()).append(")\n");
		if (r.getMesafeKm() != null) {
			sb.append("Mesafe: ").append(String.format("%.2f", r.getMesafeKm())).append(" km\n");
		}
		int count = 0;
		if (menu.getKategoriler() != null) {
			for (DtoKategori kat : menu.getKategoriler()) {
				if (kat.getUrunler() == null) {
					continue;
				}
				for (DtoUrun u : kat.getUrunler()) {
					if (!u.isMevcut() || count >= MAX_URUN_PER_RESTORAN) {
						continue;
					}
					sb.append("- [urunId=").append(u.getId()).append("] ")
							.append(u.getUrunAdi())
							.append(" | ").append(u.getFiyat()).append(" TL");
					if (u.getTahminiKalori() != null) {
						sb.append(" | ~").append(u.getTahminiKalori()).append(" kcal");
					}
					if (u.getAlerjenler() != null && !u.getAlerjenler().isEmpty()) {
						sb.append(" | alerjen: ").append(String.join(",", u.getAlerjenler()));
					}
					sb.append("\n");
					count++;
				}
			}
		}
		return sb.toString();
	}

	public List<DtoUrun> flattenUrunler(DtoMenu menu) {
		List<DtoUrun> urunler = new ArrayList<>();
		if (menu.getKategoriler() == null) {
			return urunler;
		}
		for (DtoKategori kat : menu.getKategoriler()) {
			if (kat.getUrunler() != null) {
				urunler.addAll(kat.getUrunler());
			}
		}
		return urunler;
	}
}
