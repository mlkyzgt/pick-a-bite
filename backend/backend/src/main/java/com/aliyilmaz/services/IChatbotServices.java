package com.aliyilmaz.services;

import com.aliyilmaz.dto.DtoChatIstek;
import com.aliyilmaz.dto.DtoChatYanit;

public interface IChatbotServices {

	DtoChatYanit chat(String email, DtoChatIstek istek);
}
