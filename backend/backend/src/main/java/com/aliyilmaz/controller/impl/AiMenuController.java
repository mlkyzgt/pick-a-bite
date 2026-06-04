package com.aliyilmaz.controller.impl;

import java.util.List;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aliyilmaz.dto.DtoUrun;
import com.aliyilmaz.services.IAiMenuServices;

@RestController
@RequestMapping("/pick-a-bite")
public class AiMenuController {

	private final IAiMenuServices aiMenuServices;

	public AiMenuController(IAiMenuServices aiMenuServices) {
		this.aiMenuServices = aiMenuServices;
	}

	@PostMapping("/urunler/{urunId}/ai-analiz")
	public DtoUrun urunAiAnaliz(@PathVariable Integer urunId) {
		return aiMenuServices.urunAiAnaliz(urunId);
	}

	@PostMapping("/restoranlar/{restoranId}/menu/ai-analiz")
	public List<DtoUrun> restoranMenuAiAnaliz(@PathVariable Integer restoranId) {
		return aiMenuServices.restoranMenuAiAnaliz(restoranId);
	}
}
