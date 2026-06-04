package com.aliyilmaz.ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

	@Bean
	public ChatClient chatClient(ChatModel chatModel) {
		return ChatClient.builder(chatModel).build();
	}

	@Bean
	public GroqAvailability groqAvailability(
			@Value("${spring.ai.openai.api-key:}") String apiKey) {
		boolean gecerli = apiKey != null && !apiKey.isBlank()
				&& !"local-dev-placeholder".equals(apiKey.trim());
		return new GroqAvailability(gecerli);
	}

	public record GroqAvailability(boolean available) {
	}
}
