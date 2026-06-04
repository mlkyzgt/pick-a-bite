package com.aliyilmaz.controller.impl;

import java.math.BigDecimal;
import java.security.Principal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aliyilmaz.dto.DtoKarsilastirmaIstek;
import com.aliyilmaz.dto.DtoKarsilastirmaYanit;
import com.aliyilmaz.services.IKarsilastirmaServices;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/pick-a-bite")
public class KarsilastirmaController {

	private final IKarsilastirmaServices karsilastirmaServices;

	public KarsilastirmaController(IKarsilastirmaServices karsilastirmaServices) {
		this.karsilastirmaServices = karsilastirmaServices;
	}

	@GetMapping("/karsilastir")
	public DtoKarsilastirmaYanit karsilastirGet(Principal principal,
			@RequestParam double enlem,
			@RequestParam double boylam,
			@RequestParam(required = false) Double yaricapKm,
			@RequestParam(required = false) BigDecimal butceMax) {
		return karsilastirmaServices.karsilastir(principal.getName(), enlem, boylam, yaricapKm, butceMax);
	}

	@PostMapping("/karsilastir")
	public DtoKarsilastirmaYanit karsilastirPost(Principal principal,
			@Valid @RequestBody DtoKarsilastirmaIstek istek) {
		return karsilastirmaServices.karsilastir(principal.getName(), istek);
	}
}
