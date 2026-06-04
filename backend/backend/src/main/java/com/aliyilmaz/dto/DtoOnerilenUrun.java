package com.aliyilmaz.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class DtoOnerilenUrun {

	private Integer urunId;

	private Integer restoranId;

	private String restoranAdi;

	private String urunAdi;

	private BigDecimal fiyat;

	private Integer tahminiKalori;

	private Double mesafeKm;

	private Integer uygunlukSkoru;

	private String uygunluk;
}
