package com.aliyilmaz.controller.impl;

import java.security.Principal;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aliyilmaz.dto.DtoChatIstek;
import com.aliyilmaz.dto.DtoChatYanit;
import com.aliyilmaz.services.IChatbotServices;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/pick-a-bite")
public class ChatbotController {

	private final IChatbotServices chatbotServices;

	public ChatbotController(IChatbotServices chatbotServices) {
		this.chatbotServices = chatbotServices;
	}

	@PostMapping("/chat")
	public DtoChatYanit chat(Principal principal, @Valid @RequestBody DtoChatIstek istek) {
		return chatbotServices.chat(principal.getName(), istek);
	}
}
