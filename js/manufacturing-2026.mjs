// Source: user-supplied HRDK CHANGES TO EPS 2026.pdf, PDF pages 5–7 and 17–47.
export const newTools=[
 ['grinder','Upper','그라인더','Grinder','Panggiling',5],
 ['safety-cover','Upper','방호덮개','Safety cover','Takip na pananggalang',5],
 ['air-gun','Upper','에어건','Air blow gun','Pambuga ng hangin',5],
 ['hydraulic-pump','Upper','유압펌프','Hydraulic pump','Hydraulic pump',5],
 ['soldering-iron','Upper','인두기','Soldering iron','Panghinang',5],
 ['mixer','Upper','혼합기','Mixer','Panghalo',5],
 ['gasket','Middle','가스켓','Gasket','Gasket / panatakip sa pagitan ng dugtungan',6],
 ['vise','Middle','바이스','Vise','Bench vise / pang-ipit sa mesa',6],
 ['spirit-level','Middle','수평기','Spirit level','Panukat ng pagkapantay',6],
 ['infrared-thermometer','Middle','적외선 온도계','Infrared thermometer','Infrared na panukat ng temperatura',6],
 ['clamp','Middle','클램프','Clamp','Pang-ipit',6],
 ['switch','Middle','스위치','Switch','Switch / pindutan',6],
 ['diagonal-cutter','Lower','니퍼','Diagonal cutter','Pamutol ng alambre',7],
 ['long-nose-pliers','Lower','롱노즈 플라이어','Long-nose pliers','Long-nose na plais',7],
 ['insulation-tape','Lower','절연테이프','Electrical insulation tape','Electrical tape',7],
 ['cable-tie','Lower','케이블타이','Cable tie','Pangtali ng kable',7],
 ['teflon-tape','Lower','테프론 테이프','Teflon tape','Teflon tape',7],
 ['memo-pliers','Lower','플라이어','Pliers','Plais',7]
];
// Short JCAN practice responses, paraphrased from the memo's safety dialogue.
// Korean prompts retain the memo wording; English/Tagalog are study translations.
export const safetyTopics=[
 ['PPE','보호구가 무엇인가요?','What is protective equipment?','Ano ang protective equipment?','작업 중 위험으로부터 몸을 보호하는 장비입니다.','Equipment that protects the body from workplace hazards.','Kagamitang nagpoprotekta sa katawan laban sa panganib sa trabaho.',17],
 ['Emergency exits','비상구가 무엇인가요?','What is an emergency exit?','Ano ang emergency exit?','위급할 때 안전하게 대피할 수 있는 출입구입니다.','An exit used to escape safely in an emergency.','Labasang ginagamit upang ligtas na makalikas sa emergency.',19],
 ['Safety signs','안전보건표지가 무엇인가요?','What is a safety and health sign?','Ano ang tanda para sa kaligtasan at kalusugan?','위험을 알리고 안전한 행동을 안내하는 표지입니다.','A sign that warns of hazards and guides safe actions.','Tandang nagbababala sa panganib at gumagabay sa ligtas na pagkilos.',20],
 ['Machine guards','방호장치가 무엇인가요?','What is a machine safety device?','Ano ang safety device ng makina?','기계의 위험으로부터 작업자를 보호하는 장치입니다.','A device that protects workers from machine hazards.','Kagamitang nagpoprotekta sa manggagawa mula sa panganib ng makina.',21],
 ['Chemical safety information','MSDS(물질안전보건자료)가 무엇인가요?','What is an MSDS?','Ano ang MSDS?','화학물질의 위험성과 안전한 취급 방법이 담긴 자료입니다.','Information about chemical hazards and safe handling.','Impormasyon tungkol sa panganib ng kemikal at ligtas na paghawak nito.',22],
 ['Confined spaces','밀폐공간이 무엇인가요?','What is a confined space?','Ano ang confined space?','통풍이 부족하고 산소 부족이나 유해가스의 위험이 있는 공간입니다.','A poorly ventilated space that may contain harmful gases or lack oxygen.','Lugar na kulang sa bentilasyon at maaaring may mapanganib na gas o kulang sa oxygen.',23],
 ['Running machines','가동 중인 기계를 왜 정비하면 안 될까요?','Why must you not service a running machine?','Bakit bawal kumpunihin ang makinang umaandar?','기계에 끼이거나 다칠 수 있기 때문입니다.','Moving machinery can trap or injure you.','Maaaring maipit o masugatan sa gumagalaw na makina.',24],
 ['Unfamiliar machines','모르는 기계를 왜 임의로 조작하면 안 될까요?','Why must you not operate an unfamiliar machine without permission?','Bakit bawal basta gamitin ang makinang hindi mo alam?','예상하지 못한 작동으로 사고가 날 수 있기 때문입니다.','Unexpected movement can cause an accident.','Maaaring magdulot ng aksidente ang hindi inaasahang paggalaw.',25],
 ['Keep safety devices','안전장치·시설을 왜 해체·해지하면 안될까요?','Why must safety devices not be removed or disabled?','Bakit bawal tanggalin o patayin ang safety device?','사고가 났을 때 작업자를 보호할 수 없기 때문입니다.','They cannot protect workers if removed or disabled.','Hindi nito mapoprotektahan ang manggagawa kapag tinanggal o pinatay.',26],
 ['Correct tools','작업 시 왜 지정된 보조 도구·공구를 사용해야 할까요?','Why must you use the designated tools?','Bakit kailangang gamitin ang nakatalagang kasangkapan?','용도에 맞는 도구를 사용해야 사고를 예방할 수 있습니다.','Using the appropriate tools helps prevent accidents.','Nakakatulong sa pag-iwas sa aksidente ang tamang kasangkapan.',27],
 ['Forklift safety','지게차가 무엇인가요?','What is a forklift?','Ano ang forklift?','무거운 화물을 들어 올리고 운반하는 기계입니다.','A machine for lifting and moving heavy loads.','Makinang pang-angat at paglipat ng mabibigat na karga.',28],
 ['Work in pairs','2인1조 작업이 무엇인가요?','What does working in a pair mean?','Ano ang pagtatrabaho nang magkapareha?','두 사람이 함께 일하며 서로의 안전을 확인하는 것입니다.','Two people work together and monitor safety.','Dalawang taong nagtutulungan at nagbabantay sa kaligtasan.',29],
 ['Heavy equipment zones','근처에서 중장비가 작업을 하고 있으면 어떻게 해야 하나요?','What should you do near operating heavy equipment?','Ano ang gagawin malapit sa umaandar na heavy equipment?','중장비 작업구역에 접근하지 않아야 합니다.','Stay out of the heavy equipment operating area.','Umiwas sa lugar kung saan umaandar ang heavy equipment.',30],
 ['Fire prevention','화재 가능 물질 주변에서 왜 화기를 금지 할까요?','Why are flames prohibited near flammable materials?','Bakit bawal ang apoy malapit sa madaling masunog na materyal?','불이 날 위험이 크기 때문입니다.','There is a high risk of fire.','Malaki ang panganib ng sunog.',31],
 ['Chemical ventilation','화학물질 취급 시 왜 환기장치를 가동해야 할까요?','Why must ventilation run when handling chemicals?','Bakit kailangan ang bentilasyon sa paghawak ng kemikal?','유해한 가스와 먼지를 밖으로 내보내기 위해서입니다.','To remove harmful gases and dust.','Upang mailabas ang mapanganib na gas at alikabok.',32],
 ['Restricted areas','통제구역은 왜 허가 없이 출입 금지 할까요?','Why is permission required to enter restricted areas?','Bakit kailangan ng pahintulot sa restricted area?','사고 위험이 높기 때문입니다.','These areas have a higher accident risk.','Mas mataas ang panganib ng aksidente sa lugar na ito.',33],
 ['Safe lifting','무거운 물건은 어떻게 들어야 하나요?','How should you lift a heavy object?','Paano dapat buhatin ang mabigat na bagay?','장비나 다른 사람의 도움을 이용합니다. 혼자 들 수 있으면 허리를 펴고 다리 힘으로 듭니다.','Use equipment or help. For a safe individual lift, keep the back straight and use the legs.','Gumamit ng kagamitan o humingi ng tulong. Kung ligtas buhatin mag-isa, panatilihing tuwid ang likod at gamitin ang lakas ng mga binti.',34],
 ['Handling equipment','무거운 물건을 옮길 때에는 어떻게 해야 하나요?','How should you move a heavy object?','Paano dapat ilipat ang mabigat na bagay?','적절한 운반기구를 사용해야 합니다.','Use appropriate handling equipment.','Gumamit ng angkop na kagamitan sa paglipat.',35],
 ['Safe walkways','안전 통로가 무엇인가요?','What is a safe walkway?','Ano ang ligtas na daanan?','위험을 피하며 안전하게 이동할 수 있는 통로입니다.','A route provided for safe movement away from hazards.','Daanang inilaan para sa ligtas na paglakad, malayo sa panganib.',36],
 ['No phone use','작업 중 왜 휴대폰을 사용하면 안 될까요?','Why must you not use a phone while working?','Bakit bawal gumamit ng cellphone habang nagtatrabaho?','주의가 분산되어 사고 위험이 높아지기 때문입니다.','Distraction increases the risk of an accident.','Nawawala ang pokus at tumataas ang panganib ng aksidente.',37],
 ['Housekeeping','작업장에서 정리 정돈 및 청소 왜 해야 할까요?','Why must the workplace be tidy and clean?','Bakit kailangang maayos at malinis ang trabaho?','넘어지거나 미끄러지는 사고를 예방하기 위해서입니다.','To prevent trips and slips.','Upang maiwasan ang pagkatisod at pagkadulas.',38],
 ['Tool storage','공구를 왜 지정된 자리에 두어야 할까요?','Why must tools be stored in their assigned place?','Bakit kailangang ibalik ang kasangkapan sa tamang lagayan?','분실과 파손을 막고 사고를 예방하기 위해서입니다.','To prevent loss, damage, and accidents.','Upang maiwasan ang pagkawala, pagkasira, at aksidente.',39],
 ['Hygiene','작업 후 밥 먹기 전에 무엇을 해야 하나요?','What should you do before eating after work?','Ano ang gagawin bago kumain pagkatapos magtrabaho?','손을 깨끗이 씻어야 합니다.','Wash your hands thoroughly.','Hugasan nang mabuti ang mga kamay.',40],
 ['Disconnect power','기계의 청소·수리 작업 전에는 무엇을 해야 하나요?','What must happen before machine cleaning or repair?','Ano ang dapat gawin bago linisin o kumpunihin ang makina?','정해진 안전 절차에 따라 전원을 차단해야 합니다.','Disconnect power following the required safety procedure.','Putulin ang power ayon sa itinakdang safety procedure.',41],
 ['Check embers','화기 취급 시 왜 불씨·불티를 확인해야 할까요?','Why must you check for embers and sparks after hot work?','Bakit kailangang suriin ang baga at sparks matapos ang hot work?','남은 불씨가 나중에 화재를 일으킬 수 있기 때문입니다.','Remaining embers can start a fire later.','Maaaring pagmulan ng sunog ang natitirang baga.',42],
 ['Evacuation first','화재 시 왜 대피가 우선일까요?','Why is evacuation the priority during a fire?','Bakit inuuna ang paglikas kapag may sunog?','연기와 유독가스가 생명을 위협하기 때문입니다.','Smoke and toxic gases threaten life.','Nanganganib ang buhay dahil sa usok at nakalalasong gas.',43],
 ['Ask when unsure','모르는 작업은 왜 물어봐야 할까요?','Why should you ask about an unfamiliar task?','Bakit kailangang magtanong tungkol sa hindi alam na gawain?','잘못된 작업으로 자신과 동료가 다칠 수 있기 때문입니다.','Incorrect work can injure you and coworkers.','Maaaring masaktan ka at ang katrabaho sa maling paggawa.',44],
 ['Report hazards','사고위험 발견 시 왜 알려줘야 할까요?','Why must you report a hazard you find?','Bakit kailangang iulat ang nakitang panganib?','위험을 그대로 두면 사고가 날 수 있기 때문입니다.','A hazard left unreported can cause an accident.','Maaaring magdulot ng aksidente ang panganib na hindi naiulat.',45],
 ['Heat protection','날씨가 너무 더우면 어떻게 해야 하나요?','What should you do in very hot weather?','Ano ang gagawin kapag napakainit ng panahon?','물을 자주 마시고 그늘에서 쉬어야 합니다.','Drink water often and rest in the shade.','Madalas uminom ng tubig at magpahinga sa lilim.',46],
 ['Stop and evacuate','사고의 위험이 있으면 어떻게 해야 하나요?','What should you do if there is a risk of an accident?','Ano ang gagawin kung may panganib ng aksidente?','작업을 중지하고 안전한 곳으로 대피해야 합니다.','Stop work and move to a safe place.','Itigil ang trabaho at lumikas sa ligtas na lugar.',47]
];
export function safetyPhase(index){return index<6?'Before work':index<20?'During work':index<25?'After work':'Abnormal situations';}
export const memoQuestions=[
 ...newTools.map(t=>['2026 tools — '+t[1],'이것은 무엇입니까?','What is this manufacturing tool?','Ano ang kasangkapang ito sa manufacturing?',`${t[2]}입니다.`,t[3]+'.',t[4]+'.',t[0],`HRDK memo, PDF page ${t[5]}. Tool identification; labels follow the supplied reference.`]),
 ...safetyTopics.map((t,i)=>['Safety — '+safetyPhase(i),...t.slice(1,7),null,`HRDK memo, PDF page ${t[7]}, safety topic ${i+1}: ${t[0]}. Short JCAN sample response.`])
];
