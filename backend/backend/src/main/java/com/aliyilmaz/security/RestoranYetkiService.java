package com.aliyilmaz.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.aliyilmaz.entities.Kategori;
import com.aliyilmaz.entities.Kullanici;
import com.aliyilmaz.entities.Rol;
import com.aliyilmaz.entities.Urun;
import com.aliyilmaz.repository.KategoriRepository;
import com.aliyilmaz.repository.KullaniciRepository;
import com.aliyilmaz.repository.UrunRepository;

@Service
public class RestoranYetkiService {

	private final KullaniciRepository kullaniciRepository;
	private final KategoriRepository kategoriRepository;
	private final UrunRepository urunRepository;

	public RestoranYetkiService(KullaniciRepository kullaniciRepository,
			KategoriRepository kategoriRepository,
			UrunRepository urunRepository) {
		this.kullaniciRepository = kullaniciRepository;
		this.kategoriRepository = kategoriRepository;
		this.urunRepository = urunRepository;
	}

	public void kontrolRestoranSahibi(String email, Integer restoranId) {
		Kullanici k = kullaniciRepository.findByEmail(email)
				.orElseThrow(() -> new AccessDeniedException("Kullanıcı bulunamadı."));
		if (k.getRol() != Rol.RESTORAN || k.getRestoranId() == null || !k.getRestoranId().equals(restoranId)) {
			throw new AccessDeniedException("Bu restoranın menüsünü yalnızca işletme sahibi yönetebilir.");
		}
	}

	public void kontrolKategoriSahibi(String email, Integer kategoriId) {
		Kategori k = kategoriRepository.findById(kategoriId)
				.orElseThrow(() -> new AccessDeniedException("Kategori bulunamadı."));
		kontrolRestoranSahibi(email, k.getRestoran().getId());
	}

	public void kontrolUrunSahibi(String email, Integer urunId) {
		Urun u = urunRepository.findById(urunId)
				.orElseThrow(() -> new AccessDeniedException("Ürün bulunamadı."));
		kontrolRestoranSahibi(email, u.getKategori().getRestoran().getId());
	}
}
