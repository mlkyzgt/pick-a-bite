package com.aliyilmaz.ai;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class StructuredQueryParser {

	private static final Pattern JSON_BLOCK = Pattern.compile("\\{[\\s\\S]*\\}");
	private final ObjectMapper objectMapper = new ObjectMapper();

	public ParsedQuery parse(String llmResponse) {
		String json = extractJson(llmResponse);
		if (json == null) {
			return ParsedQuery.empty();
		}
		try {
			JsonNode node = objectMapper.readTree(json);
			BigDecimal butceMax = null;
			if (node.has("butceMax") && !node.get("butceMax").isNull()) {
				butceMax = node.get("butceMax").decimalValue();
			}
			List<String> anahtarKelimeler = readStringArray(node, "anahtarKelimeler");
			Set<String> kacinilacakAlerjenler = new HashSet<>(readStringArray(node, "kacinilacakAlerjenler"));
			String aciklama = node.has("aciklama") ? node.get("aciklama").asText("") : "";
			return new ParsedQuery(butceMax, anahtarKelimeler, kacinilacakAlerjenler, aciklama);
		} catch (Exception e) {
			return ParsedQuery.empty();
		}
	}

	public UrunAnalizSonuc parseUrunAnaliz(String llmResponse) {
		String json = extractJson(llmResponse);
		if (json == null) {
			return null;
		}
		try {
			JsonNode node = objectMapper.readTree(json);
			Integer kalori = node.has("tahminiKalori") && !node.get("tahminiKalori").isNull()
					? node.get("tahminiKalori").asInt() : null;
			Integer protein = node.has("tahminiProtein") && !node.get("tahminiProtein").isNull()
					? node.get("tahminiProtein").asInt() : null;
			Integer karbonhidrat = node.has("tahminiKarbonhidrat") && !node.get("tahminiKarbonhidrat").isNull()
					? node.get("tahminiKarbonhidrat").asInt() : null;
			Integer yag = node.has("tahminiYag") && !node.get("tahminiYag").isNull()
					? node.get("tahminiYag").asInt() : null;
			Set<String> alerjenler = new HashSet<>(readStringArray(node, "alerjenler"));
			return new UrunAnalizSonuc(kalori, protein, karbonhidrat, yag, alerjenler);
		} catch (Exception e) {
			return null;
		}
	}

	private String extractJson(String text) {
		if (text == null || text.isBlank()) {
			return null;
		}
		Matcher m = JSON_BLOCK.matcher(text.trim());
		if (m.find()) {
			return m.group();
		}
		return null;
	}

	private List<String> readStringArray(JsonNode node, String field) {
		List<String> list = new ArrayList<>();
		if (node.has(field) && node.get(field).isArray()) {
			for (JsonNode item : node.get(field)) {
				list.add(item.asText().toLowerCase().trim());
			}
		}
		return list;
	}

	public record ParsedQuery(
			BigDecimal butceMax,
			List<String> anahtarKelimeler,
			Set<String> kacinilacakAlerjenler,
			String aciklama) {

		public static ParsedQuery empty() {
			return new ParsedQuery(null, List.of(), Set.of(), "");
		}
	}

	public record UrunAnalizSonuc(
			Integer tahminiKalori,
			Integer tahminiProtein,
			Integer tahminiKarbonhidrat,
			Integer tahminiYag,
			Set<String> alerjenler) {
	}
}
