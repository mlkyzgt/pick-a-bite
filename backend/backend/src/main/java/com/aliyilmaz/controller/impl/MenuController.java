package com.aliyilmaz.controller.impl;

import java.security.Principal;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.aliyilmaz.dto.DtoKategori;
import com.aliyilmaz.dto.DtoKategoriIU;
import com.aliyilmaz.dto.DtoMenu;
import com.aliyilmaz.dto.DtoUrun;
import com.aliyilmaz.dto.DtoUrunIU;
import com.aliyilmaz.security.RestoranYetkiService;
import com.aliyilmaz.services.IMenuServices;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/pick-a-bite")
public class MenuController {

	private final IMenuServices menuServices;
	private final RestoranYetkiService yetkiService;

	public MenuController(IMenuServices menuServices, RestoranYetkiService yetkiService) {
		this.menuServices = menuServices;
		this.yetkiService = yetkiService;
	}

	@GetMapping("/restoranlar/{restoranId}/menu")
	public DtoMenu menuGetir(@PathVariable Integer restoranId) {
		return menuServices.menuGetir(restoranId);
	}

	@PostMapping("/restoranlar/{restoranId}/kategoriler")
	@ResponseStatus(HttpStatus.CREATED)
	public DtoKategori kategoriOlustur(Principal principal, @PathVariable Integer restoranId,
			@Valid @RequestBody DtoKategoriIU istek) {
		yetkiService.kontrolRestoranSahibi(principal.getName(), restoranId);
		return menuServices.kategoriOlustur(restoranId, istek);
	}

	@PutMapping("/kategoriler/{kategoriId}")
	public DtoKategori kategoriGuncelle(Principal principal, @PathVariable Integer kategoriId,
			@Valid @RequestBody DtoKategoriIU istek) {
		yetkiService.kontrolKategoriSahibi(principal.getName(), kategoriId);
		return menuServices.kategoriGuncelle(kategoriId, istek);
	}

	@DeleteMapping("/kategoriler/{kategoriId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void kategoriSil(Principal principal, @PathVariable Integer kategoriId) {
		yetkiService.kontrolKategoriSahibi(principal.getName(), kategoriId);
		menuServices.kategoriSil(kategoriId);
	}

	@PostMapping("/kategoriler/{kategoriId}/urunler")
	@ResponseStatus(HttpStatus.CREATED)
	public DtoUrun urunOlustur(Principal principal, @PathVariable Integer kategoriId,
			@Valid @RequestBody DtoUrunIU istek) {
		yetkiService.kontrolKategoriSahibi(principal.getName(), kategoriId);
		return menuServices.urunOlustur(kategoriId, istek);
	}

	@PutMapping("/urunler/{urunId}")
	public DtoUrun urunGuncelle(Principal principal, @PathVariable Integer urunId,
			@Valid @RequestBody DtoUrunIU istek) {
		yetkiService.kontrolUrunSahibi(principal.getName(), urunId);
		return menuServices.urunGuncelle(urunId, istek);
	}

	@DeleteMapping("/urunler/{urunId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void urunSil(Principal principal, @PathVariable Integer urunId) {
		yetkiService.kontrolUrunSahibi(principal.getName(), urunId);
		menuServices.urunSil(urunId);
	}
}
