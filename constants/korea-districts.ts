export interface RegionDong {
  name: string;
  latitude: number;
  longitude: number;
}

export interface RegionGu {
  name: string;
  latitude: number;
  longitude: number;
  dongs: RegionDong[];
}

export const KOREA_DISTRICTS: RegionGu[] = [
  // --- 서울특별시 (기존 데이터) ---
  {
    name: '서울 강남구',
    latitude: 37.5172,
    longitude: 127.0473,
    dongs: [
      { name: '역삼동', latitude: 37.4996, longitude: 127.0276 },
      { name: '삼성동', latitude: 37.5140, longitude: 127.0572 },
      { name: '청담동', latitude: 37.5222, longitude: 127.0543 },
      { name: '신사동', latitude: 37.5200, longitude: 127.0196 },
    ],
  },
  {
    name: '서울 마포구',
    latitude: 37.5638,
    longitude: 126.9084,
    dongs: [
      { name: '연남동', latitude: 37.5663, longitude: 126.9235 },
      { name: '합정동', latitude: 37.5498, longitude: 126.9140 },
      { name: '망원동', latitude: 37.5556, longitude: 126.9049 },
    ],
  },
  {
    name: '서울 송파구',
    latitude: 37.5145,
    longitude: 127.1059,
    dongs: [
      { name: '잠실동', latitude: 37.5108, longitude: 127.0869 },
      { name: '석촌동', latitude: 37.5056, longitude: 127.1025 },
      { name: '방이동', latitude: 37.5106, longitude: 127.1213 },
    ],
  },
  {
    name: '서울 서초구',
    latitude: 37.4836,
    longitude: 127.0327,
    dongs: [
      { name: '서초동', latitude: 37.4917, longitude: 127.0124 },
      { name: '반포동', latitude: 37.5041, longitude: 127.0051 },
      { name: '방배동', latitude: 37.4801, longitude: 126.9995 },
    ],
  },
  {
    name: '서울 용산구',
    latitude: 37.5324,
    longitude: 126.9904,
    dongs: [
      { name: '이태원동', latitude: 37.5345, longitude: 126.9940 },
      { name: '한남동', latitude: 37.5368, longitude: 127.0033 },
    ],
  },
  {
    name: '서울 성동구',
    latitude: 37.5634,
    longitude: 127.0369,
    dongs: [
      { name: '성수동', latitude: 37.5446, longitude: 127.0564 },
      { name: '왕십리동', latitude: 37.5619, longitude: 127.0375 },
    ],
  },
  
  // --- 경기도 ---
  {
    name: '경기 수원시',
    latitude: 37.2636,
    longitude: 127.0286,
    dongs: [
      { name: '인계동', latitude: 37.2662, longitude: 127.0324 },
      { name: '영통동', latitude: 37.2514, longitude: 127.0722 },
      { name: '광교동', latitude: 37.2991, longitude: 127.0435 },
    ],
  },
  {
    name: '경기 성남시',
    latitude: 37.4201,
    longitude: 127.1265,
    dongs: [
      { name: '정자동', latitude: 37.3614, longitude: 127.1115 },
      { name: '서현동', latitude: 37.3820, longitude: 127.1275 },
      { name: '판교동', latitude: 37.3941, longitude: 127.0945 },
    ],
  },
  {
    name: '경기 고양시',
    latitude: 37.6583,
    longitude: 126.8320,
    dongs: [
      { name: '일산동', latitude: 37.6822, longitude: 126.7720 },
      { name: '장항동', latitude: 37.6534, longitude: 126.7681 },
    ],
  },

  // --- 부산광역시 ---
  {
    name: '부산 해운대구',
    latitude: 35.1631,
    longitude: 129.1636,
    dongs: [
      { name: '우동', latitude: 35.1610, longitude: 129.1558 },
      { name: '중동', latitude: 35.1651, longitude: 129.1666 },
      { name: '좌동', latitude: 35.1704, longitude: 129.1764 },
    ],
  },
  {
    name: '부산 부산진구',
    latitude: 35.1627,
    longitude: 129.0531,
    dongs: [
      { name: '부전동 (서면)', latitude: 35.1550, longitude: 129.0594 },
      { name: '전포동', latitude: 35.1541, longitude: 129.0649 },
    ],
  },

  // --- 대구광역시 ---
  {
    name: '대구 수성구',
    latitude: 35.8582,
    longitude: 128.6298,
    dongs: [
      { name: '범어동', latitude: 35.8596, longitude: 128.6247 },
      { name: '두산동', latitude: 35.8291, longitude: 128.6186 },
    ],
  },
  {
    name: '대구 중구',
    latitude: 35.8694,
    longitude: 128.5943,
    dongs: [
      { name: '동성로', latitude: 35.8714, longitude: 128.5958 },
      { name: '삼덕동', latitude: 35.8659, longitude: 128.6045 },
    ],
  },

  // --- 인천광역시 ---
  {
    name: '인천 연수구',
    latitude: 37.4093,
    longitude: 126.6781,
    dongs: [
      { name: '송도동', latitude: 37.3878, longitude: 126.6385 },
      { name: '연수동', latitude: 37.4168, longitude: 126.6806 },
    ],
  },
  {
    name: '인천 남동구',
    latitude: 37.4475,
    longitude: 126.7317,
    dongs: [
      { name: '구월동', latitude: 37.4474, longitude: 126.7093 },
      { name: '논현동', latitude: 37.3995, longitude: 126.7262 },
    ],
  },

  // --- 광주광역시 ---
  {
    name: '광주 서구',
    latitude: 35.1518,
    longitude: 126.8902,
    dongs: [
      { name: '상무동', latitude: 35.1481, longitude: 126.8530 },
      { name: '치평동', latitude: 35.1507, longitude: 126.8510 },
    ],
  },

  // --- 대전광역시 ---
  {
    name: '대전 서구',
    latitude: 36.3551,
    longitude: 127.3838,
    dongs: [
      { name: '둔산동', latitude: 36.3516, longitude: 127.3820 },
      { name: '월평동', latitude: 36.3571, longitude: 127.3592 },
    ],
  },
  {
    name: '대전 유성구',
    latitude: 36.3622,
    longitude: 127.3562,
    dongs: [
      { name: '봉명동', latitude: 36.3541, longitude: 127.3431 },
      { name: '궁동', latitude: 36.3639, longitude: 127.3486 },
    ],
  },

  // --- 제주특별자치도 ---
  {
    name: '제주 제주시',
    latitude: 33.4996,
    longitude: 126.5312,
    dongs: [
      { name: '연동', latitude: 33.4839, longitude: 126.4975 },
      { name: '노형동', latitude: 33.4833, longitude: 126.4789 },
      { name: '애월읍', latitude: 33.4616, longitude: 126.3195 },
    ],
  },
  {
    name: '제주 서귀포시',
    latitude: 33.2541,
    longitude: 126.5601,
    dongs: [
      { name: '중문동', latitude: 33.2530, longitude: 126.4258 },
      { name: '안덕면', latitude: 33.2570, longitude: 126.3315 },
    ],
  }
];
