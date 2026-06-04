package com.aliyilmaz.controller.impl;

import java.security.Principal;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aliyilmaz.dto.DtoOneriIstek;
import com.aliyilmaz.dto.DtoOneriYanit;
import com.aliyilmaz.services.IOneriServices;

@RestController
@RequestMapping("/pick-a-bite")
public class OneriController {

	private final IOneriServices oneriServices;

	public OneriController(IOneriServices oneriServices) {
		this.oneriServices = oneriServices;
	}

	@PostMapping("/oneri")
	public DtoOneriYanit oneri(Principal principal, @RequestBody DtoOneriIstek istek) {
		return oneriServices.oneri(principal.getName(), istek);
	}
}
