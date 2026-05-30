// 全国省份城市坐标数据（全部地级市）
export interface City {
  name: string
  lat: number
  lon: number
}

export interface Province {
  name: string
  cities: City[]
}

export const PROVINCES: Province[] = [
  { name: '北京', cities: [{ name: '北京', lat: 39.90, lon: 116.41 }] },
  { name: '上海', cities: [{ name: '上海', lat: 31.23, lon: 121.47 }] },
  { name: '天津', cities: [{ name: '天津', lat: 39.13, lon: 117.20 }] },
  { name: '重庆', cities: [{ name: '重庆', lat: 29.56, lon: 106.55 }] },
  { name: '河北', cities: [
    { name: '石家庄', lat: 38.04, lon: 114.51 },{ name: '唐山', lat: 39.63, lon: 118.18 },
    { name: '秦皇岛', lat: 39.94, lon: 119.60 },{ name: '邯郸', lat: 36.63, lon: 114.54 },
    { name: '邢台', lat: 37.07, lon: 114.50 },{ name: '保定', lat: 38.87, lon: 115.46 },
    { name: '张家口', lat: 40.77, lon: 114.89 },{ name: '承德', lat: 40.95, lon: 117.96 },
    { name: '沧州', lat: 38.31, lon: 116.84 },{ name: '廊坊', lat: 39.52, lon: 116.68 },
    { name: '衡水', lat: 37.74, lon: 115.67 },
  ]},
  { name: '山西', cities: [
    { name: '太原', lat: 37.87, lon: 112.55 },{ name: '大同', lat: 40.08, lon: 113.30 },
    { name: '阳泉', lat: 37.87, lon: 113.58 },{ name: '长治', lat: 36.20, lon: 113.12 },
    { name: '晋城', lat: 35.49, lon: 112.85 },{ name: '朔州', lat: 39.33, lon: 112.43 },
    { name: '晋中', lat: 37.69, lon: 112.75 },{ name: '运城', lat: 35.03, lon: 111.01 },
    { name: '忻州', lat: 38.42, lon: 112.73 },{ name: '临汾', lat: 36.09, lon: 111.52 },
    { name: '吕梁', lat: 37.52, lon: 111.14 },
  ]},
  { name: '内蒙古', cities: [
    { name: '呼和浩特', lat: 40.84, lon: 111.75 },{ name: '包头', lat: 40.66, lon: 109.84 },
    { name: '乌海', lat: 39.66, lon: 106.82 },{ name: '赤峰', lat: 42.26, lon: 118.89 },
    { name: '通辽', lat: 43.65, lon: 122.24 },{ name: '鄂尔多斯', lat: 39.61, lon: 109.78 },
    { name: '呼伦贝尔', lat: 49.21, lon: 119.77 },{ name: '巴彦淖尔', lat: 40.74, lon: 107.39 },
    { name: '乌兰察布', lat: 41.00, lon: 113.13 },
  ]},
  { name: '辽宁', cities: [
    { name: '沈阳', lat: 41.80, lon: 123.43 },{ name: '大连', lat: 38.91, lon: 121.60 },
    { name: '鞍山', lat: 41.11, lon: 122.99 },{ name: '抚顺', lat: 41.88, lon: 123.96 },
    { name: '本溪', lat: 41.30, lon: 123.76 },{ name: '丹东', lat: 40.00, lon: 124.35 },
    { name: '锦州', lat: 41.10, lon: 121.13 },{ name: '营口', lat: 40.67, lon: 122.24 },
    { name: '阜新', lat: 42.02, lon: 121.67 },{ name: '辽阳', lat: 41.27, lon: 123.17 },
    { name: '盘锦', lat: 41.12, lon: 122.07 },{ name: '铁岭', lat: 42.29, lon: 123.84 },
    { name: '朝阳', lat: 41.57, lon: 120.45 },{ name: '葫芦岛', lat: 40.71, lon: 120.84 },
  ]},
  { name: '吉林', cities: [
    { name: '长春', lat: 43.88, lon: 125.32 },{ name: '吉林', lat: 43.84, lon: 126.55 },
    { name: '四平', lat: 43.17, lon: 124.35 },{ name: '辽源', lat: 42.90, lon: 125.14 },
    { name: '通化', lat: 41.73, lon: 125.94 },{ name: '白山', lat: 41.94, lon: 126.42 },
    { name: '松原', lat: 45.14, lon: 124.82 },{ name: '白城', lat: 45.62, lon: 122.84 },
    { name: '延边', lat: 42.89, lon: 129.51 },
  ]},
  { name: '黑龙江', cities: [
    { name: '哈尔滨', lat: 45.75, lon: 126.65 },{ name: '齐齐哈尔', lat: 47.35, lon: 123.96 },
    { name: '鸡西', lat: 45.30, lon: 130.97 },{ name: '鹤岗', lat: 47.33, lon: 130.30 },
    { name: '双鸭山', lat: 46.65, lon: 131.16 },{ name: '大庆', lat: 46.59, lon: 125.10 },
    { name: '伊春', lat: 47.73, lon: 128.84 },{ name: '佳木斯', lat: 46.80, lon: 130.32 },
    { name: '七台河', lat: 45.77, lon: 131.00 },{ name: '牡丹江', lat: 44.55, lon: 129.63 },
    { name: '黑河', lat: 50.24, lon: 127.53 },{ name: '绥化', lat: 46.64, lon: 126.97 },
  ]},
  { name: '江苏', cities: [
    { name: '南京', lat: 32.06, lon: 118.80 },{ name: '无锡', lat: 31.57, lon: 120.30 },
    { name: '徐州', lat: 34.26, lon: 117.19 },{ name: '常州', lat: 31.81, lon: 119.97 },
    { name: '苏州', lat: 31.30, lon: 120.62 },{ name: '南通', lat: 31.98, lon: 120.89 },
    { name: '连云港', lat: 34.60, lon: 119.22 },{ name: '淮安', lat: 33.61, lon: 119.02 },
    { name: '盐城', lat: 33.35, lon: 120.16 },{ name: '扬州', lat: 32.39, lon: 119.44 },
    { name: '镇江', lat: 32.19, lon: 119.45 },{ name: '泰州', lat: 32.46, lon: 119.92 },
    { name: '宿迁', lat: 33.96, lon: 118.28 },
  ]},
  { name: '浙江', cities: [
    { name: '杭州', lat: 30.27, lon: 120.15 },{ name: '宁波', lat: 29.87, lon: 121.54 },
    { name: '温州', lat: 28.00, lon: 120.67 },{ name: '嘉兴', lat: 30.75, lon: 120.76 },
    { name: '湖州', lat: 30.87, lon: 120.09 },{ name: '绍兴', lat: 30.00, lon: 120.58 },
    { name: '金华', lat: 29.08, lon: 119.65 },{ name: '衢州', lat: 28.94, lon: 118.87 },
    { name: '舟山', lat: 30.04, lon: 122.11 },{ name: '台州', lat: 28.66, lon: 121.42 },
    { name: '丽水', lat: 28.47, lon: 119.92 },
  ]},
  { name: '安徽', cities: [
    { name: '合肥', lat: 31.82, lon: 117.23 },{ name: '芜湖', lat: 31.33, lon: 118.38 },
    { name: '蚌埠', lat: 32.92, lon: 117.36 },{ name: '淮南', lat: 32.63, lon: 117.00 },
    { name: '马鞍山', lat: 31.67, lon: 118.51 },{ name: '淮北', lat: 33.97, lon: 116.79 },
    { name: '铜陵', lat: 30.93, lon: 117.81 },{ name: '安庆', lat: 30.54, lon: 117.06 },
    { name: '黄山', lat: 29.72, lon: 118.34 },{ name: '滁州', lat: 32.30, lon: 118.32 },
    { name: '阜阳', lat: 32.89, lon: 115.81 },{ name: '宿州', lat: 33.64, lon: 116.96 },
    { name: '六安', lat: 31.74, lon: 116.52 },{ name: '亳州', lat: 33.84, lon: 115.78 },
    { name: '池州', lat: 30.66, lon: 117.49 },{ name: '宣城', lat: 30.95, lon: 118.76 },
  ]},
  { name: '福建', cities: [
    { name: '福州', lat: 26.07, lon: 119.30 },{ name: '厦门', lat: 24.48, lon: 118.09 },
    { name: '莆田', lat: 25.44, lon: 119.01 },{ name: '三明', lat: 26.26, lon: 117.64 },
    { name: '泉州', lat: 24.87, lon: 118.68 },{ name: '漳州', lat: 24.51, lon: 117.65 },
    { name: '南平', lat: 26.64, lon: 118.18 },{ name: '龙岩', lat: 25.10, lon: 117.01 },
    { name: '宁德', lat: 26.66, lon: 119.53 },
  ]},
  { name: '江西', cities: [
    { name: '南昌', lat: 28.68, lon: 115.86 },{ name: '景德镇', lat: 29.29, lon: 117.21 },
    { name: '萍乡', lat: 27.62, lon: 113.85 },{ name: '九江', lat: 29.71, lon: 116.00 },
    { name: '新余', lat: 27.82, lon: 114.92 },{ name: '鹰潭', lat: 28.26, lon: 117.07 },
    { name: '赣州', lat: 25.83, lon: 114.93 },{ name: '吉安', lat: 27.11, lon: 114.99 },
    { name: '宜春', lat: 27.80, lon: 114.39 },{ name: '抚州', lat: 27.95, lon: 116.36 },
    { name: '上饶', lat: 28.45, lon: 117.94 },
  ]},
  { name: '山东', cities: [
    { name: '济南', lat: 36.65, lon: 116.99 },{ name: '青岛', lat: 36.07, lon: 120.38 },
    { name: '淄博', lat: 36.81, lon: 118.05 },{ name: '枣庄', lat: 34.81, lon: 117.32 },
    { name: '东营', lat: 37.43, lon: 118.67 },{ name: '烟台', lat: 37.54, lon: 121.45 },
    { name: '潍坊', lat: 36.71, lon: 119.16 },{ name: '济宁', lat: 35.41, lon: 116.59 },
    { name: '泰安', lat: 36.19, lon: 117.09 },{ name: '威海', lat: 37.51, lon: 122.12 },
    { name: '日照', lat: 35.42, lon: 119.53 },{ name: '临沂', lat: 35.10, lon: 118.36 },
    { name: '德州', lat: 37.44, lon: 116.36 },{ name: '聊城', lat: 36.46, lon: 115.99 },
    { name: '滨州', lat: 37.38, lon: 117.97 },{ name: '菏泽', lat: 35.23, lon: 115.48 },
  ]},
  { name: '河南', cities: [
    { name: '郑州', lat: 34.75, lon: 113.65 },{ name: '开封', lat: 34.80, lon: 114.31 },
    { name: '洛阳', lat: 34.62, lon: 112.45 },{ name: '平顶山', lat: 33.77, lon: 113.19 },
    { name: '安阳', lat: 36.10, lon: 114.39 },{ name: '鹤壁', lat: 35.75, lon: 114.30 },
    { name: '新乡', lat: 35.30, lon: 113.93 },{ name: '焦作', lat: 35.22, lon: 113.24 },
    { name: '濮阳', lat: 35.76, lon: 115.03 },{ name: '许昌', lat: 34.04, lon: 113.85 },
    { name: '漯河', lat: 33.58, lon: 114.02 },{ name: '三门峡', lat: 34.77, lon: 111.20 },
    { name: '南阳', lat: 33.00, lon: 112.53 },{ name: '商丘', lat: 34.44, lon: 115.66 },
    { name: '信阳', lat: 32.15, lon: 114.07 },{ name: '周口', lat: 33.63, lon: 114.65 },
    { name: '驻马店', lat: 32.98, lon: 114.02 },
  ]},
  { name: '湖北', cities: [
    { name: '武汉', lat: 30.59, lon: 114.31 },{ name: '黄石', lat: 30.20, lon: 115.04 },
    { name: '十堰', lat: 32.63, lon: 110.80 },{ name: '宜昌', lat: 30.69, lon: 111.29 },
    { name: '襄阳', lat: 32.01, lon: 112.14 },{ name: '鄂州', lat: 30.39, lon: 114.89 },
    { name: '荆门', lat: 31.04, lon: 112.20 },{ name: '孝感', lat: 30.92, lon: 113.92 },
    { name: '荆州', lat: 30.33, lon: 112.24 },{ name: '黄冈', lat: 30.45, lon: 114.87 },
    { name: '咸宁', lat: 29.84, lon: 114.32 },{ name: '随州', lat: 31.69, lon: 113.38 },
    { name: '恩施', lat: 30.27, lon: 109.49 },
  ]},
  { name: '湖南', cities: [
    { name: '长沙', lat: 28.23, lon: 112.94 },{ name: '株洲', lat: 27.83, lon: 113.13 },
    { name: '湘潭', lat: 27.83, lon: 112.94 },{ name: '衡阳', lat: 26.89, lon: 112.57 },
    { name: '邵阳', lat: 27.24, lon: 111.47 },{ name: '岳阳', lat: 29.36, lon: 113.13 },
    { name: '常德', lat: 29.03, lon: 111.70 },{ name: '张家界', lat: 29.12, lon: 110.48 },
    { name: '益阳', lat: 28.55, lon: 112.36 },{ name: '郴州', lat: 25.77, lon: 113.01 },
    { name: '永州', lat: 26.42, lon: 111.61 },{ name: '怀化', lat: 27.55, lon: 110.00 },
    { name: '娄底', lat: 27.70, lon: 112.00 },{ name: '湘西', lat: 28.31, lon: 109.74 },
  ]},
  { name: '广东', cities: [
    { name: '广州', lat: 23.13, lon: 113.26 },{ name: '韶关', lat: 24.81, lon: 113.59 },
    { name: '深圳', lat: 22.54, lon: 114.06 },{ name: '珠海', lat: 22.27, lon: 113.58 },
    { name: '汕头', lat: 23.35, lon: 116.68 },{ name: '佛山', lat: 23.02, lon: 113.12 },
    { name: '江门', lat: 22.58, lon: 113.08 },{ name: '湛江', lat: 21.27, lon: 110.36 },
    { name: '茂名', lat: 21.66, lon: 110.93 },{ name: '肇庆', lat: 23.05, lon: 112.46 },
    { name: '惠州', lat: 23.11, lon: 114.42 },{ name: '梅州', lat: 24.29, lon: 116.12 },
    { name: '汕尾', lat: 22.79, lon: 115.37 },{ name: '河源', lat: 23.74, lon: 114.70 },
    { name: '阳江', lat: 21.86, lon: 111.98 },{ name: '清远', lat: 23.68, lon: 113.06 },
    { name: '东莞', lat: 23.02, lon: 113.75 },{ name: '中山', lat: 22.52, lon: 113.39 },
    { name: '潮州', lat: 23.66, lon: 116.62 },{ name: '揭阳', lat: 23.55, lon: 116.37 },
    { name: '云浮', lat: 22.93, lon: 112.04 },
  ]},
  { name: '广西', cities: [
    { name: '南宁', lat: 22.82, lon: 108.37 },{ name: '柳州', lat: 24.33, lon: 109.43 },
    { name: '桂林', lat: 25.27, lon: 110.29 },{ name: '梧州', lat: 23.47, lon: 111.28 },
    { name: '北海', lat: 21.48, lon: 109.12 },{ name: '防城港', lat: 21.69, lon: 108.35 },
    { name: '钦州', lat: 21.95, lon: 108.62 },{ name: '贵港', lat: 23.10, lon: 109.60 },
    { name: '玉林', lat: 22.63, lon: 110.15 },{ name: '百色', lat: 23.90, lon: 106.62 },
    { name: '贺州', lat: 24.40, lon: 111.57 },{ name: '河池', lat: 24.69, lon: 108.09 },
    { name: '来宾', lat: 23.73, lon: 109.23 },{ name: '崇左', lat: 22.38, lon: 107.36 },
  ]},
  { name: '海南', cities: [
    { name: '海口', lat: 20.02, lon: 110.35 },{ name: '三亚', lat: 18.25, lon: 109.50 },
    { name: '三沙', lat: 16.83, lon: 112.33 },{ name: '儋州', lat: 19.52, lon: 109.58 },
    { name: '文昌', lat: 19.54, lon: 110.75 },{ name: '琼海', lat: 19.26, lon: 110.47 },
    { name: '万宁', lat: 18.80, lon: 110.39 },{ name: '东方', lat: 19.10, lon: 108.65 },
    { name: '五指山', lat: 18.77, lon: 109.52 },{ name: '陵水', lat: 18.51, lon: 110.04 },
    { name: '乐东', lat: 18.75, lon: 109.17 },{ name: '澄迈', lat: 19.74, lon: 110.01 },
    { name: '临高', lat: 19.91, lon: 109.69 },{ name: '定安', lat: 19.68, lon: 110.36 },
    { name: '屯昌', lat: 19.35, lon: 110.10 },{ name: '昌江', lat: 19.26, lon: 109.05 },
    { name: '保亭', lat: 18.64, lon: 109.70 },{ name: '琼中', lat: 19.03, lon: 109.84 },
    { name: '白沙', lat: 19.23, lon: 109.45 },
  ]},
  { name: '四川', cities: [
    { name: '成都', lat: 30.57, lon: 104.07 },{ name: '自贡', lat: 29.34, lon: 104.78 },
    { name: '攀枝花', lat: 26.58, lon: 101.72 },{ name: '泸州', lat: 28.87, lon: 105.44 },
    { name: '德阳', lat: 31.13, lon: 104.40 },{ name: '绵阳', lat: 31.47, lon: 104.74 },
    { name: '广元', lat: 32.44, lon: 105.84 },{ name: '遂宁', lat: 30.53, lon: 105.57 },
    { name: '内江', lat: 29.58, lon: 105.06 },{ name: '乐山', lat: 29.55, lon: 103.77 },
    { name: '南充', lat: 30.80, lon: 106.08 },{ name: '眉山', lat: 30.08, lon: 103.85 },
    { name: '宜宾', lat: 28.75, lon: 104.64 },{ name: '广安', lat: 30.47, lon: 106.63 },
    { name: '达州', lat: 31.21, lon: 107.47 },{ name: '雅安', lat: 30.01, lon: 103.01 },
    { name: '巴中', lat: 31.87, lon: 106.77 },{ name: '资阳', lat: 30.12, lon: 104.63 },
    { name: '阿坝', lat: 31.90, lon: 102.22 },{ name: '甘孜', lat: 30.05, lon: 101.96 },
    { name: '凉山', lat: 27.88, lon: 102.27 },
  ]},
  { name: '贵州', cities: [
    { name: '贵阳', lat: 26.65, lon: 106.63 },{ name: '六盘水', lat: 26.59, lon: 104.83 },
    { name: '遵义', lat: 27.72, lon: 106.93 },{ name: '安顺', lat: 26.25, lon: 105.95 },
    { name: '毕节', lat: 27.30, lon: 105.29 },{ name: '铜仁', lat: 27.72, lon: 109.19 },
    { name: '黔西南', lat: 25.09, lon: 104.90 },{ name: '黔东南', lat: 26.58, lon: 107.98 },
    { name: '黔南', lat: 26.26, lon: 107.52 },
  ]},
  { name: '云南', cities: [
    { name: '昆明', lat: 25.04, lon: 102.68 },{ name: '曲靖', lat: 25.49, lon: 103.80 },
    { name: '玉溪', lat: 24.35, lon: 102.54 },{ name: '保山', lat: 25.11, lon: 99.17 },
    { name: '昭通', lat: 27.34, lon: 103.72 },{ name: '丽江', lat: 26.87, lon: 100.23 },
    { name: '普洱', lat: 22.79, lon: 100.97 },{ name: '临沧', lat: 23.88, lon: 100.09 },
    { name: '楚雄', lat: 25.04, lon: 101.55 },{ name: '红河', lat: 23.36, lon: 103.38 },
    { name: '文山', lat: 23.37, lon: 104.24 },{ name: '西双版纳', lat: 22.01, lon: 100.80 },
    { name: '大理', lat: 25.59, lon: 100.23 },{ name: '德宏', lat: 24.44, lon: 98.58 },
    { name: '迪庆', lat: 27.83, lon: 99.70 },
  ]},
  { name: '陕西', cities: [
    { name: '西安', lat: 34.26, lon: 108.94 },{ name: '铜川', lat: 34.90, lon: 108.94 },
    { name: '宝鸡', lat: 34.36, lon: 107.24 },{ name: '咸阳', lat: 34.33, lon: 108.72 },
    { name: '渭南', lat: 34.50, lon: 109.51 },{ name: '延安', lat: 36.59, lon: 109.49 },
    { name: '汉中', lat: 33.07, lon: 107.03 },{ name: '榆林', lat: 38.28, lon: 109.73 },
    { name: '安康', lat: 32.68, lon: 109.03 },{ name: '商洛', lat: 33.87, lon: 109.94 },
  ]},
  { name: '甘肃', cities: [
    { name: '兰州', lat: 36.06, lon: 103.83 },{ name: '嘉峪关', lat: 39.77, lon: 98.29 },
    { name: '金昌', lat: 38.50, lon: 102.19 },{ name: '白银', lat: 36.54, lon: 104.14 },
    { name: '天水', lat: 34.58, lon: 105.72 },{ name: '武威', lat: 37.93, lon: 102.64 },
    { name: '张掖', lat: 38.93, lon: 100.45 },{ name: '平凉', lat: 35.54, lon: 106.67 },
    { name: '酒泉', lat: 39.73, lon: 98.51 },{ name: '庆阳', lat: 35.73, lon: 107.64 },
    { name: '定西', lat: 35.58, lon: 104.63 },{ name: '陇南', lat: 33.40, lon: 104.92 },
    { name: '临夏', lat: 35.60, lon: 103.21 },{ name: '甘南', lat: 34.99, lon: 102.91 },
  ]},
  { name: '青海', cities: [
    { name: '西宁', lat: 36.62, lon: 101.78 },{ name: '海东', lat: 36.50, lon: 102.10 },
    { name: '海北', lat: 36.95, lon: 100.90 },{ name: '海南', lat: 36.28, lon: 100.62 },
    { name: '黄南', lat: 35.52, lon: 102.02 },{ name: '果洛', lat: 34.47, lon: 100.24 },
    { name: '玉树', lat: 33.00, lon: 97.01 },{ name: '海西', lat: 37.37, lon: 97.37 },
  ]},
  { name: '宁夏', cities: [
    { name: '银川', lat: 38.49, lon: 106.23 },{ name: '石嘴山', lat: 39.02, lon: 106.38 },
    { name: '吴忠', lat: 37.99, lon: 106.20 },{ name: '固原', lat: 36.00, lon: 106.24 },
    { name: '中卫', lat: 37.51, lon: 105.19 },
  ]},
  { name: '新疆', cities: [
    { name: '乌鲁木齐', lat: 43.83, lon: 87.62 },{ name: '克拉玛依', lat: 45.58, lon: 84.87 },
    { name: '吐鲁番', lat: 42.95, lon: 89.19 },{ name: '哈密', lat: 42.83, lon: 93.52 },
    { name: '昌吉', lat: 44.01, lon: 87.31 },{ name: '博尔塔拉', lat: 44.90, lon: 82.07 },
    { name: '巴音郭楞', lat: 41.76, lon: 86.15 },{ name: '阿克苏', lat: 41.17, lon: 80.26 },
    { name: '喀什', lat: 39.47, lon: 75.99 },{ name: '和田', lat: 37.11, lon: 79.92 },
    { name: '伊犁', lat: 43.91, lon: 81.33 },{ name: '塔城', lat: 46.75, lon: 82.99 },
    { name: '阿勒泰', lat: 47.85, lon: 88.14 },
  ]},
  { name: '西藏', cities: [
    { name: '拉萨', lat: 29.65, lon: 91.13 },{ name: '日喀则', lat: 29.27, lon: 88.88 },
    { name: '昌都', lat: 31.14, lon: 97.17 },{ name: '林芝', lat: 29.65, lon: 94.36 },
    { name: '山南', lat: 29.24, lon: 91.77 },{ name: '那曲', lat: 31.48, lon: 92.05 },
    { name: '阿里', lat: 32.50, lon: 80.11 },
  ]},
  { name: '香港', cities: [{ name: '香港', lat: 22.32, lon: 114.17 }] },
  { name: '澳门', cities: [{ name: '澳门', lat: 22.20, lon: 113.55 }] },
  { name: '台湾', cities: [
    { name: '台北', lat: 25.03, lon: 121.57 },{ name: '新北', lat: 25.01, lon: 121.47 },
    { name: '桃园', lat: 24.99, lon: 121.31 },{ name: '台中', lat: 24.15, lon: 120.67 },
    { name: '台南', lat: 22.99, lon: 120.21 },{ name: '高雄', lat: 22.62, lon: 120.31 },
    { name: '基隆', lat: 25.13, lon: 121.74 },{ name: '新竹', lat: 24.80, lon: 120.97 },
    { name: '嘉义', lat: 23.48, lon: 120.44 },{ name: '花莲', lat: 23.99, lon: 121.60 },
  ]},
]

const CITY_KEY = 'aura_weather_city'

export function getSavedCity(): City | null {
  const saved = localStorage.getItem(CITY_KEY)
  if (saved) {
    try { return JSON.parse(saved) } catch {}
  }
  return null
}

export function saveCity(city: City) {
  localStorage.setItem(CITY_KEY, JSON.stringify(city))
}