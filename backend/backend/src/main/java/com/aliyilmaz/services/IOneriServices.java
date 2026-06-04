package com.aliyilmaz.services;

import com.aliyilmaz.dto.DtoOneriIstek;
import com.aliyilmaz.dto.DtoOneriYanit;

public interface IOneriServices {

	DtoOneriYanit oneri(String email, DtoOneriIstek istek);
}
