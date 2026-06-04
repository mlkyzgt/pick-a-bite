package com.aliyilmaz.dto;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DtoChatIstek {

	@NotBlank(message = "Mesaj zorunludur.")
	@Size(max = 2000)
	private String mesaj;

	private Integer restoranId;

	private Double enlem;

	private Double boylam;

	private Double yaricapKm;

	/** Bu oturumda daha önce önerilen ürünler — yeni farklı öneriler için hariç tutulur */
	private List<Integer> haricTutUrunIds = new ArrayList<>();
}
