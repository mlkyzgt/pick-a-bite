package com.aliyilmaz.controller.impl;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aliyilmaz.services.impl.MenuImportService;

@RestController
@RequestMapping("/pick-a-bite/admin")
public class AdminController {

	private final MenuImportService menuImportService;

	public AdminController(MenuImportService menuImportService) {
		this.menuImportService = menuImportService;
	}

	@PostMapping("/menu-senkron")
	public Map<String, Object> menuSenkron() {
		int urunSayisi = menuImportService.menuJsonSenkron();
		return Map.of(
				"mesaj", "Menü senkronizasyonu tamamlandı.",
				"eklenenUrunSayisi", urunSayisi);
	}
}
