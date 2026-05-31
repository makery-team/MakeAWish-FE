export interface SeoulDong {
  name: string;
  latitude: number;
  longitude: number;
}

export interface SeoulGu {
  name: string;
  latitude: number;
  longitude: number;
  dongs: SeoulDong[];
}

export const SEOUL_DISTRICTS: SeoulGu[] = [
  {
    name: '강남구',
    latitude: 37.5172,
    longitude: 127.0473,
    dongs: [
      { name: '역삼동', latitude: 37.4996, longitude: 127.0276 },
      { name: '삼성동', latitude: 37.5140, longitude: 127.0572 },
      { name: '청담동', latitude: 37.5222, longitude: 127.0543 },
      { name: '압구정동', latitude: 37.5262, longitude: 127.0283 },
      { name: '신사동', latitude: 37.5200, longitude: 127.0196 },
      { name: '대치동', latitude: 37.4943, longitude: 127.0619 },
    ],
  },
  {
    name: '강동구',
    latitude: 37.5301,
    longitude: 127.1238,
    dongs: [
      { name: '천호동', latitude: 37.5384, longitude: 127.1238 },
      { name: '암사동', latitude: 37.5534, longitude: 127.1315 },
      { name: '명일동', latitude: 37.5486, longitude: 127.1411 },
      { name: '길동', latitude: 37.5417, longitude: 127.1355 },
      { name: '강일동', latitude: 37.5697, longitude: 127.1634 },
    ],
  },
  {
    name: '강북구',
    latitude: 37.6396,
    longitude: 127.0253,
    dongs: [
      { name: '수유동', latitude: 37.6382, longitude: 127.0254 },
      { name: '미아동', latitude: 37.6291, longitude: 127.0279 },
      { name: '번동', latitude: 37.6407, longitude: 127.0119 },
      { name: '우이동', latitude: 37.6618, longitude: 127.0108 },
    ],
  },
  {
    name: '강서구',
    latitude: 37.5509,
    longitude: 126.8495,
    dongs: [
      { name: '화곡동', latitude: 37.5477, longitude: 126.8500 },
      { name: '마곡동', latitude: 37.5601, longitude: 126.8302 },
      { name: '발산동', latitude: 37.5583, longitude: 126.8383 },
      { name: '방화동', latitude: 37.5740, longitude: 126.8117 },
      { name: '가양동', latitude: 37.5624, longitude: 126.8547 },
    ],
  },
  {
    name: '관악구',
    latitude: 37.4783,
    longitude: 126.9516,
    dongs: [
      { name: '신림동', latitude: 37.4840, longitude: 126.9296 },
      { name: '봉천동', latitude: 37.4812, longitude: 126.9568 },
      { name: '서림동', latitude: 37.4912, longitude: 126.9429 },
      { name: '남현동', latitude: 37.4701, longitude: 126.9709 },
    ],
  },
  {
    name: '광진구',
    latitude: 37.5385,
    longitude: 127.0823,
    dongs: [
      { name: '건대입구', latitude: 37.5404, longitude: 127.0696 },
      { name: '화양동', latitude: 37.5437, longitude: 127.0707 },
      { name: '구의동', latitude: 37.5424, longitude: 127.0934 },
      { name: '자양동', latitude: 37.5322, longitude: 127.0813 },
      { name: '광장동', latitude: 37.5534, longitude: 127.0978 },
    ],
  },
  {
    name: '구로구',
    latitude: 37.4955,
    longitude: 126.8878,
    dongs: [
      { name: '구로동', latitude: 37.4958, longitude: 126.8878 },
      { name: '신도림동', latitude: 37.5086, longitude: 126.8909 },
      { name: '가리봉동', latitude: 37.4830, longitude: 126.8927 },
      { name: '개봉동', latitude: 37.4962, longitude: 126.8660 },
    ],
  },
  {
    name: '금천구',
    latitude: 37.4564,
    longitude: 126.8954,
    dongs: [
      { name: '시흥동', latitude: 37.4494, longitude: 126.8931 },
      { name: '가산동', latitude: 37.4763, longitude: 126.8821 },
      { name: '독산동', latitude: 37.4618, longitude: 126.9016 },
    ],
  },
  {
    name: '노원구',
    latitude: 37.6541,
    longitude: 127.0567,
    dongs: [
      { name: '상계동', latitude: 37.6565, longitude: 127.0684 },
      { name: '중계동', latitude: 37.6346, longitude: 127.0685 },
      { name: '하계동', latitude: 37.6270, longitude: 127.0664 },
      { name: '월계동', latitude: 37.6433, longitude: 127.0494 },
    ],
  },
  {
    name: '도봉구',
    latitude: 37.6688,
    longitude: 127.0471,
    dongs: [
      { name: '쌍문동', latitude: 37.6516, longitude: 127.0362 },
      { name: '방학동', latitude: 37.6674, longitude: 127.0375 },
      { name: '창동', latitude: 37.6530, longitude: 127.0461 },
      { name: '도봉동', latitude: 37.6878, longitude: 127.0474 },
    ],
  },
  {
    name: '동대문구',
    latitude: 37.5745,
    longitude: 127.0397,
    dongs: [
      { name: '전농동', latitude: 37.5784, longitude: 127.0537 },
      { name: '답십리동', latitude: 37.5654, longitude: 127.0609 },
      { name: '장안동', latitude: 37.5780, longitude: 127.0632 },
      { name: '이문동', latitude: 37.5886, longitude: 127.0467 },
      { name: '회기동', latitude: 37.5893, longitude: 127.0348 },
    ],
  },
  {
    name: '동작구',
    latitude: 37.5124,
    longitude: 126.9393,
    dongs: [
      { name: '노량진동', latitude: 37.5127, longitude: 126.9357 },
      { name: '상도동', latitude: 37.4989, longitude: 126.9487 },
      { name: '사당동', latitude: 37.4765, longitude: 126.9814 },
      { name: '신대방동', latitude: 37.4876, longitude: 126.9188 },
    ],
  },
  {
    name: '마포구',
    latitude: 37.5638,
    longitude: 126.9084,
    dongs: [
      { name: '연남동', latitude: 37.5663, longitude: 126.9235 },
      { name: '합정동', latitude: 37.5498, longitude: 126.9140 },
      { name: '홍대앞', latitude: 37.5571, longitude: 126.9253 },
      { name: '상수동', latitude: 37.5482, longitude: 126.9240 },
      { name: '망원동', latitude: 37.5556, longitude: 126.9049 },
    ],
  },
  {
    name: '서대문구',
    latitude: 37.5791,
    longitude: 126.9368,
    dongs: [
      { name: '신촌동', latitude: 37.5554, longitude: 126.9366 },
      { name: '연희동', latitude: 37.5720, longitude: 126.9297 },
      { name: '홍제동', latitude: 37.5806, longitude: 126.9404 },
      { name: '북가좌동', latitude: 37.5789, longitude: 126.9041 },
    ],
  },
  {
    name: '서초구',
    latitude: 37.4836,
    longitude: 127.0327,
    dongs: [
      { name: '서초동', latitude: 37.4917, longitude: 127.0124 },
      { name: '반포동', latitude: 37.5041, longitude: 127.0051 },
      { name: '방배동', latitude: 37.4801, longitude: 126.9995 },
      { name: '잠원동', latitude: 37.5188, longitude: 127.0041 },
      { name: '양재동', latitude: 37.4680, longitude: 127.0337 },
    ],
  },
  {
    name: '성동구',
    latitude: 37.5634,
    longitude: 127.0369,
    dongs: [
      { name: '성수동', latitude: 37.5446, longitude: 127.0564 },
      { name: '왕십리동', latitude: 37.5619, longitude: 127.0375 },
      { name: '행당동', latitude: 37.5596, longitude: 127.0269 },
      { name: '금호동', latitude: 37.5515, longitude: 127.0198 },
    ],
  },
  {
    name: '성북구',
    latitude: 37.5894,
    longitude: 127.0167,
    dongs: [
      { name: '성북동', latitude: 37.5898, longitude: 127.0024 },
      { name: '길음동', latitude: 37.6053, longitude: 127.0215 },
      { name: '종암동', latitude: 37.5994, longitude: 127.0345 },
      { name: '돈암동', latitude: 37.5934, longitude: 127.0116 },
    ],
  },
  {
    name: '송파구',
    latitude: 37.5145,
    longitude: 127.1059,
    dongs: [
      { name: '잠실동', latitude: 37.5108, longitude: 127.0869 },
      { name: '석촌동', latitude: 37.5056, longitude: 127.1025 },
      { name: '방이동', latitude: 37.5106, longitude: 127.1213 },
      { name: '가락동', latitude: 37.4931, longitude: 127.1176 },
      { name: '문정동', latitude: 37.4832, longitude: 127.1230 },
    ],
  },
  {
    name: '양천구',
    latitude: 37.5169,
    longitude: 126.8664,
    dongs: [
      { name: '목동', latitude: 37.5265, longitude: 126.8748 },
      { name: '신정동', latitude: 37.5177, longitude: 126.8552 },
      { name: '신월동', latitude: 37.5108, longitude: 126.8423 },
    ],
  },
  {
    name: '영등포구',
    latitude: 37.5263,
    longitude: 126.8962,
    dongs: [
      { name: '여의도동', latitude: 37.5219, longitude: 126.9244 },
      { name: '영등포동', latitude: 37.5179, longitude: 126.9078 },
      { name: '당산동', latitude: 37.5340, longitude: 126.9011 },
      { name: '문래동', latitude: 37.5190, longitude: 126.8968 },
    ],
  },
  {
    name: '용산구',
    latitude: 37.5324,
    longitude: 126.9904,
    dongs: [
      { name: '이태원동', latitude: 37.5345, longitude: 126.9940 },
      { name: '한남동', latitude: 37.5368, longitude: 127.0033 },
      { name: '후암동', latitude: 37.5449, longitude: 126.9795 },
      { name: '효창동', latitude: 37.5434, longitude: 126.9641 },
    ],
  },
  {
    name: '은평구',
    latitude: 37.6026,
    longitude: 126.9291,
    dongs: [
      { name: '응암동', latitude: 37.5981, longitude: 126.9157 },
      { name: '갈현동', latitude: 37.6183, longitude: 126.9201 },
      { name: '불광동', latitude: 37.6115, longitude: 126.9280 },
      { name: '진관동', latitude: 37.6358, longitude: 126.9157 },
    ],
  },
  {
    name: '종로구',
    latitude: 37.5735,
    longitude: 126.9790,
    dongs: [
      { name: '인사동', latitude: 37.5735, longitude: 126.9851 },
      { name: '혜화동', latitude: 37.5822, longitude: 127.0016 },
      { name: '청운동', latitude: 37.5849, longitude: 126.9680 },
      { name: '부암동', latitude: 37.5936, longitude: 126.9654 },
      { name: '익선동', latitude: 37.5757, longitude: 126.9939 },
    ],
  },
  {
    name: '중구',
    latitude: 37.5641,
    longitude: 126.9979,
    dongs: [
      { name: '명동', latitude: 37.5635, longitude: 126.9826 },
      { name: '신당동', latitude: 37.5619, longitude: 127.0185 },
      { name: '황학동', latitude: 37.5700, longitude: 127.0184 },
      { name: '을지로동', latitude: 37.5664, longitude: 127.0000 },
    ],
  },
  {
    name: '중랑구',
    latitude: 37.6063,
    longitude: 127.0927,
    dongs: [
      { name: '면목동', latitude: 37.5943, longitude: 127.0904 },
      { name: '상봉동', latitude: 37.6040, longitude: 127.0830 },
      { name: '망우동', latitude: 37.6082, longitude: 127.1073 },
      { name: '중화동', latitude: 37.6100, longitude: 127.0762 },
    ],
  },
];
