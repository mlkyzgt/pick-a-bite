package com.aliyilmaz.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class DtoKarsilastirmaOge {

	private String restoranAdi;

	private Integer restoranId;

	private String urunAdi;

	private Integer urunId;

	private BigDecimal fiyat;

	private Double mesafeKm;

	private String uygunluk;

	private Integer uygunlukSkoru;
}
