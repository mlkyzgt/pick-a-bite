package com.aliyilmaz.services;

import java.math.BigDecimal;

import com.aliyilmaz.dto.DtoKarsilastirmaIstek;
import com.aliyilmaz.dto.DtoKarsilastirmaYanit;

public interface IKarsilastirmaServices {

	DtoKarsilastirmaYanit karsilastir(String email, double enlem, double boylam, Double yaricapKm, BigDecimal butceMax);

	DtoKarsilastirmaYanit karsilastir(String email, DtoKarsilastirmaIstek istek);
}
