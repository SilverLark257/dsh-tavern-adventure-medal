/* dsh-tavern-adventure-medal —— 浏览器侧（单文件，零依赖）
 * ============================================================================
 * 结构：
 *   0. 常量、图标、内置皮肤
 *   1. 小工具（DOM、日期、数字、码点、成就档位）
 *   2. 皮肤存储（localStorage 抽象）
 *   3. 覆盖层会话（选择器 / 奖牌 / 裁剪 / 皮肤管理 / 提示）
 *   4. Canvas 导出
 *   5. 插件入口（registerComposerTool → registerHeaderTool → registerComposerAction）
 *
 * 所有用户数据（卡名、消息正文）只用于计数或 textContent，绝不 innerHTML。
 * 所有用户操作各自 try/catch，失败只弹可爱提示，不让酒馆页面白屏。
 * ========================================================================== */

window.__ModuleLoader__.load({
  id: 'dsh-tavern-adventure-medal',
  factory(require) {
    let React = null
    try {
      React = require('react')
    } catch (error) {
      React = null
    }

    const NS = 'dsh-tavern-adventure-medal'
    const HOST = {
      list: NS + '/list',
      stats: NS + '/stats',
      counts: NS + '/counts',
    }
    const SKINS_KEY = 'dsh-tavern-adventure-medal:skins:v1'
    const SELECTED_KEY = 'dsh-tavern-adventure-medal:selected:v1'
    const DEFAULT_SKIN_ID = 'default'
    const DESIGN_W = 420
    const DESIGN_H = 560
    const SLOGAN = '愿每一次冒险，都有星光作伴'
    const FONT_STACK = '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC","Source Han Sans SC",sans-serif'
    const TIERS = [
      { key: 'rainbow', n: 1000, label: '不朽传说' },
      { key: 'gold', n: 500, label: '酒馆传说' },
      { key: 'silver', n: 300, label: '传奇冒险者' },
      { key: 'bronze', n: 100, label: '小有名气' },
    ]

    /* ------------------------------------------------------------------ *
     * 0. 图标 / 内置皮肤
     * ------------------------------------------------------------------ */

    const ICON_MEDAL_LAUNCHER = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7.5 13.2 5 21l4-2 2.2 3L12 15.5 12.8 22l2.2-3 4 2-2.5-7.8" fill="#FF9EBB" stroke="#E77A9C" stroke-width="1.1" stroke-linejoin="round"/><circle cx="12" cy="9" r="6.2" fill="#F4B942" stroke="#D99A2B" stroke-width="1.2"/><circle cx="12" cy="9" r="4.2" fill="#FFF7EC"/><path d="m12 5.9 1.05 2.12 2.34.34-1.7 1.65.4 2.33L12 11.24l-2.09 1.1.4-2.33-1.7-1.65 2.34-.34Z" fill="#F4B942" stroke="#D99A2B" stroke-width=".6" stroke-linejoin="round"/></svg>'

    const ICON_PERSON = '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="8" cy="5.2" r="2.6" stroke="currentColor" stroke-width="1.6"/><path d="M2.8 14c.5-2.7 2.4-4.2 5.2-4.2s4.7 1.5 5.2 4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    const ICON_DICE = '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8 1.6 14 5v6l-6 3.4L2 11V5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M2 5l6 3.4L14 5M8 8.4V14.4" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><circle cx="5.4" cy="7.3" r=".8" fill="currentColor"/><circle cx="10.6" cy="7.3" r=".8" fill="currentColor"/><circle cx="8" cy="11.3" r=".8" fill="currentColor"/></svg>'
    const ICON_BOOK = '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 2.6h7.2c1 0 1.8.8 1.8 1.8v9H4.8c-1 0-1.8-.8-1.8-1.8Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M3 11.4h9M5.2 5.2h4.2M5.2 7.6h4.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
    const ICON_CALENDAR = '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="2.2" y="3.4" width="11.6" height="10.4" rx="2.2" stroke="currentColor" stroke-width="1.5"/><path d="M2.2 6.6h11.6M5.6 2.2v2.6M10.4 2.2v2.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="5.9" cy="9.3" r=".95" fill="currentColor"/><circle cx="8" cy="9.3" r=".95" fill="currentColor"/><circle cx="10.1" cy="9.3" r=".95" fill="currentColor"/></svg>'
    const ICON_ARROW_LEFT = '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9.8 3.2 5 8l4.8 4.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    const ICON_ARROW_RIGHT = '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6.2 3.2 11 8l-4.8 4.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    const ICON_CLOSE = '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="m3.4 3.4 9.2 9.2M12.6 3.4l-9.2 9.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
    const ICON_PALETTE = '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 2.4c4.2 0 7.6 3.1 7.6 6.9 0 2.4-1.7 3.7-3.8 3.7h-1.5c-1.1 0-1.9.8-1.9 1.9 0 .5.2 1 .5 1.4.3.4.5.8.5 1.3 0 .9-.7 1.5-1.7 1.5-4.2 0-7.6-3.4-7.6-7.6S5.8 2.4 10 2.4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="6.4" cy="8" r="1.1" fill="currentColor"/><circle cx="9.4" cy="5.8" r="1.1" fill="currentColor"/><circle cx="13" cy="7" r="1.1" fill="currentColor"/></svg>'
    const ICON_DOWNLOAD = '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 3v9.2M6.4 9.2 10 12.8l3.6-3.6M3.4 15.4v1.2h13.2v-1.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    const ICON_SPARK = '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 2.6c.5 3.7 1.7 4.9 5.4 5.4-3.7.5-4.9 1.7-5.4 5.4-.5-3.7-1.7-4.9-5.4-5.4 3.7-.5 4.9-1.7 5.4-5.4Z" fill="currentColor"/><path d="M15.6 13.2c.25 1.85.85 2.45 2.7 2.7-1.85.25-2.45.85-2.7 2.7-.25-1.85-.85-2.45-2.7-2.7 1.85-.25 2.45-.85 2.7-2.7Z" fill="currentColor" opacity=".7"/></svg>'
    const ICON_TRASH = '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3.2 4.4h9.6M6.4 2.8h3.2M5 4.4l.6 8.2c0 .6.5 1 1.1 1h2.6c.6 0 1.1-.4 1.1-1L11 4.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    const ICON_CHECK = '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="m3 8.4 3.2 3.2L13 4.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    const ICON_STAR4 = '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 0c.7 6.3 3.7 9.3 10 10-6.3.7-9.3 3.7-10 10C9.3 13.7 6.3 10.7 0 10 6.3 9.3 9.3 6.3 10 0Z" fill="currentColor"/></svg>'

    /** 五角星路径：外圈 outer、内圈 inner，尖朝上。 */
    function starPath(cx, cy, outer, inner) {
      const points = []
      for (let i = 0; i < 10; i += 1) {
        const radius = i % 2 === 0 ? outer : inner
        const angle = -Math.PI / 2 + i * Math.PI / 5
        points.push((cx + radius * Math.cos(angle)).toFixed(2) + ' ' + (cy + radius * Math.sin(angle)).toFixed(2))
      }
      return 'M' + points.join('L') + 'Z'
    }

    const MEDAL_STAR = starPath(60, 46, 19, 7.9)

    // 只用路径 / 渐变 / 透明度：canvas 里画同一份 SVG，导出与屏幕一致。
    const MEDAL_SVG = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">',
      '<defs>',
      // 黄铜凸面：高光在左上，右下压暗做出体积
      '<radialGradient id="am-brass-face" cx=".34" cy=".26" r=".84"><stop offset="0" stop-color="#FFF8E2"/><stop offset=".16" stop-color="#FFE7A8"/><stop offset=".40" stop-color="#F5C766"/><stop offset=".64" stop-color="#DFA43D"/><stop offset=".84" stop-color="#B87A1E"/><stop offset="1" stop-color="#8A560F"/></radialGradient>',
      '<linearGradient id="am-brass-rim" x1=".1" y1="0" x2=".9" y2="1"><stop offset="0" stop-color="#FFEFC6"/><stop offset=".34" stop-color="#E9B34F"/><stop offset=".72" stop-color="#C88A25"/><stop offset="1" stop-color="#9A6412"/></linearGradient>',
      '<linearGradient id="am-star-face" x1=".22" y1="0" x2=".78" y2="1"><stop offset="0" stop-color="#FFDF8E"/><stop offset=".45" stop-color="#E8B44B"/><stop offset="1" stop-color="#C4851F"/></linearGradient>',
      '<radialGradient id="am-face" cx=".36" cy=".28" r=".8"><stop offset="0" stop-color="#FFFDF7"/><stop offset=".7" stop-color="#FCF1DF"/><stop offset="1" stop-color="#F0DCC0"/></radialGradient>',
      '<linearGradient id="am-ribbon-honey" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#FFD98A"/><stop offset=".55" stop-color="#F4B942"/><stop offset="1" stop-color="#CE8C22"/></linearGradient>',
      '<linearGradient id="am-ribbon-pink" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#FFB9CE"/><stop offset=".55" stop-color="#F98AAB"/><stop offset="1" stop-color="#D9668D"/></linearGradient>',
      '</defs>',

      // 缎带阴影（叠在勋章后下方）
      '<g opacity=".26"><path d="M37 64 26 108l20-11 9 15 5-32Z" fill="#3C2314" transform="translate(1.8 2.6)"/><path d="M83 64 94 108 74 97l-9 15-5-32Z" fill="#3C2314" transform="translate(1.8 2.6)"/></g>',

      // 蜜糖金缎带 + 折叠暗面 + 折痕
      '<path d="M37 64 26 108l20-11 9 15 5-32Z" fill="url(#am-ribbon-honey)" stroke="#B87A1E" stroke-width="1.1" stroke-linejoin="round"/>',
      '<path d="M37 64 26 108 36 104Z" fill="#8C5A12" opacity=".18"/>',
      '<path d="M43 67 36 103" stroke="#A86A1B" stroke-opacity=".38" stroke-width="1.1" stroke-linecap="round"/>',
      '<path d="M40 70 33 99" stroke="#FFF6DC" stroke-opacity=".42" stroke-width="1.2" stroke-linecap="round"/>',

      // 草莓粉缎带 + 折叠暗面 + 折痕
      '<path d="M83 64 94 108 74 97l-9 15-5-32Z" fill="url(#am-ribbon-pink)" stroke="#C2557C" stroke-width="1.1" stroke-linejoin="round"/>',
      '<path d="M83 64 94 108 84 104Z" fill="#8C3A5C" opacity=".18"/>',
      '<path d="M77 67 84 103" stroke="#B24A70" stroke-opacity=".38" stroke-width="1.1" stroke-linecap="round"/>',
      '<path d="M80 70 87 99" stroke="#FFF0F5" stroke-opacity=".48" stroke-width="1.2" stroke-linecap="round"/>',

      // 滚花齿边外圈
      '<circle cx="60" cy="50" r="39" fill="url(#am-brass-rim)" stroke="#7E4C0C" stroke-width="1"/>',
      '<circle cx="60" cy="50" r="39" fill="none" stroke="#FFF2CC" stroke-opacity=".55" stroke-width="3.4" stroke-dasharray="1.5 2.6"/>',
      '<circle cx="60" cy="50" r="35.2" fill="none" stroke="#7E4C0C" stroke-opacity=".38" stroke-width="1.1"/>',

      // 凸面主体
      '<circle cx="60" cy="50" r="34.4" fill="url(#am-brass-face)" stroke="#8A560F" stroke-opacity=".5" stroke-width=".9"/>',
      '<path d="M33 39c6-11 21-16 34-13" fill="none" stroke="#FFFDF0" stroke-opacity=".55" stroke-width="2.6" stroke-linecap="round"/>',
      '<path d="M86 64c-6 10-19 15-31 12" fill="none" stroke="#7E4C0C" stroke-opacity=".2" stroke-width="2.2" stroke-linecap="round"/>',

      // 镜面
      '<circle cx="60" cy="50" r="27" fill="url(#am-face)" stroke="#D99A2B" stroke-width="1.1"/>',
      '<circle cx="60" cy="50" r="23" fill="none" stroke="#8C5B3F" stroke-opacity=".16" stroke-width="1.3" stroke-dasharray="2 3"/>',

      // 星形浮雕：右下暗面 + 左上高光 + 主体 + 顶部亮点
      '<path d="' + MEDAL_STAR + '" transform="translate(.9 1.1)" fill="#8A560F" opacity=".55"/>',
      '<path d="' + MEDAL_STAR + '" transform="translate(-.8 -.9)" fill="#FFF3D0" opacity=".72"/>',
      '<path d="' + MEDAL_STAR + '" fill="url(#am-star-face)" stroke="#A86A1B" stroke-width="1" stroke-linejoin="round"/>',
      '<path d="M60 29.6 63.4 39" stroke="#FFF8E2" stroke-opacity=".62" stroke-width="1.7" stroke-linecap="round"/>',

      // 铆点
      '<circle cx="42" cy="58" r="1.5" fill="#8C5B3F" opacity=".3"/><circle cx="78" cy="58" r="1.5" fill="#8C5B3F" opacity=".3"/>',
      '<circle cx="60" cy="69" r="1.3" fill="#8C5B3F" opacity=".26"/>',
      '</svg>',
    ].join('')

    function badgeSvg(tierKey) {
      const rainbow = tierKey === 'rainbow'
      const outer = rainbow
        ? '<linearGradient id="am-badge-rainbow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF9EBB"/><stop offset=".2" stop-color="#F4B942"/><stop offset=".4" stop-color="#9FE2BF"/><stop offset=".6" stop-color="#8EC5FF"/><stop offset=".8" stop-color="#C9A6FF"/><stop offset="1" stop-color="#FF9EBB"/></linearGradient>'
        : ''
      const fill = rainbow ? 'url(#am-badge-rainbow)' : tierKey === 'gold' ? '#F4B942' : tierKey === 'silver' ? '#C9CED6' : '#C98A5A'
      const stroke = tierKey === 'gold' ? '#D99A2B' : tierKey === 'silver' ? '#9AA3AD' : '#A96B3F'
      return [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">',
        '<defs>', outer, '</defs>',
        '<path d="M14 32 9 46l7.4-3.2 3.1 5.2 3.4-12.4Z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1" stroke-linejoin="round"/>',
        '<path d="M34 32 39 46l-7.4-3.2-3.1 5.2-3.4-12.4Z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1" stroke-linejoin="round"/>',
        '<path d="M24 2.2 27.1 7.5 33 4.8 33.7 11 39.8 11 37 16.6 42.5 20.1 38.2 24 42.5 27.9 37 31.4 39.8 37 33.7 37 33 43.2 27.1 40.5 24 45.8 20.9 40.5 15 43.2 14.3 37 8.2 37 11 31.4 5.5 27.9 9.8 24 5.5 20.1 11 16.6 8.2 11 14.3 11 15 4.8 20.9 7.5Z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.1" stroke-linejoin="round"/>',
        '<circle cx="24" cy="24" r="11" fill="#FFF7EC" stroke="' + stroke + '" stroke-width="1.2"/>',
        '<circle cx="24" cy="24" r="8.4" fill="none" stroke="' + stroke + '" stroke-width=".8" stroke-opacity=".35" stroke-dasharray="1.6 2"/>',
        '</svg>',
      ].join('')
    }

    function defaultSkinSvg() {
      const stars = [
        [180, 330, 1.4, '#F4B942', .85], [900, 260, 1.0, '#FF9EBB', .65], [790, 980, 1.2, '#9FE2BF', .7],
        [230, 1060, .9, '#FF9EBB', .6], [980, 720, .8, '#F4B942', .65], [120, 640, .75, '#9FE2BF', .55],
        [860, 1200, .9, '#F4B942', .55], [320, 860, .65, '#F4B942', .5],
      ]
      const starPath = (x, y, s) => {
        return 'M' + x + ' ' + (y - 14 * s)
          + ' L' + (x + 3 * s) + ' ' + (y - 3 * s)
          + ' L' + (x + 14 * s) + ' ' + y
          + ' L' + (x + 3 * s) + ' ' + (y + 3 * s)
          + ' L' + x + ' ' + (y + 14 * s)
          + ' L' + (x - 3 * s) + ' ' + (y + 3 * s)
          + ' L' + (x - 14 * s) + ' ' + y
          + ' L' + (x - 3 * s) + ' ' + (y - 3 * s) + ' Z'
      }
      const starPaths = stars.map(([x, y, s, color, opacity]) => {
        return '<path d="' + starPath(x, y, s) + '" fill="' + color + '" opacity="' + opacity + '"/>'
      }).join('')
      return [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1440" width="1080" height="1440">',
        '<defs>',
        '<linearGradient id="am-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFDF8"/><stop offset=".55" stop-color="#FFF7EC"/><stop offset="1" stop-color="#F7E8D2"/></linearGradient>',
        '<radialGradient id="am-vignette" cx=".5" cy=".42" r=".78"><stop offset=".55" stop-color="#8C5B3F" stop-opacity="0"/><stop offset="1" stop-color="#8C5B3F" stop-opacity=".20"/></radialGradient>',
        '<radialGradient id="am-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF1C8" stop-opacity=".38"/><stop offset="1" stop-color="#FFF1C8" stop-opacity="0"/></radialGradient>',
        '<linearGradient id="am-ribbon-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4B942" stop-opacity=".55"/><stop offset="1" stop-color="#D99A2B" stop-opacity=".24"/></linearGradient>',
        '<linearGradient id="am-ribbon-pink" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF9EBB" stop-opacity=".44"/><stop offset="1" stop-color="#E77A9C" stop-opacity=".18"/></linearGradient>',
        '</defs>',
        '<rect width="1080" height="1440" fill="url(#am-paper)"/>',
        '<g fill="none" stroke="#8C5B3F" stroke-linecap="round">',
        '<path d="M0 250C170 210 350 280 540 246S890 206 1080 256" stroke-opacity=".09" stroke-width="4"/>',
        '<path d="M0 420C200 380 360 452 560 416S920 376 1080 430" stroke-opacity=".07" stroke-width="3"/>',
        '<path d="M0 1080C180 1040 380 1108 560 1074S900 1036 1080 1088" stroke-opacity=".09" stroke-width="4"/>',
        '<path d="M0 1240C200 1200 360 1268 560 1234S920 1196 1080 1250" stroke-opacity=".07" stroke-width="3"/>',
        '<path d="M120 0C90 260 150 520 110 760S70 1180 120 1440" stroke-opacity=".06" stroke-width="3"/>',
        '<path d="M960 0C990 260 930 520 970 760S1010 1180 960 1440" stroke-opacity=".06" stroke-width="3"/>',
        '</g>',
        '<g>',
        '<path d="M780 0H1080V210L320 1440H0V1280Z" fill="url(#am-ribbon-gold)"/>',
        '<path d="M780 0H900L180 1440H40Z" fill="url(#am-ribbon-pink)"/>',
        '<path d="M780 0H812L92 1440H60Z" fill="#FFFDF8" opacity=".26"/>',
        '</g>',
        '<ellipse cx="540" cy="520" rx="320" ry="320" fill="url(#am-glow)"/>',
        '<g transform="translate(540 520)" fill="none" stroke="#8C5B3F" stroke-opacity=".18">',
        '<circle r="252" stroke-width="2" stroke-dasharray="4 10"/>',
        '<circle r="222" stroke-width="1"/>',
        '<path d="M0-192 22-62 152-62 48 22 90 152 0 70-90 152-48 22-152-62-22-62Z" stroke-width="1.4" opacity=".7"/>',
        '</g>',
        '<g opacity=".95">' + starPaths + '</g>',
        '<g fill="none" stroke="#8C5B3F" stroke-opacity=".14" stroke-width="2" stroke-linecap="round">',
        '<path d="M36 78C140 36 222 58 264 122"/>',
        '<path d="M1044 78C940 36 858 58 816 122"/>',
        '<path d="M36 1362C140 1404 222 1382 264 1318"/>',
        '<path d="M1044 1362C940 1404 858 1382 816 1318"/>',
        '</g>',
        '<rect x="26" y="26" width="1028" height="1388" rx="34" fill="none" stroke="#8C5B3F" stroke-opacity=".16" stroke-width="4"/>',
        '<rect x="44" y="44" width="992" height="1352" rx="24" fill="none" stroke="#F4B942" stroke-opacity=".22" stroke-width="1.5"/>',
        '<rect width="1080" height="1440" fill="url(#am-vignette)"/>',
        '</svg>',
      ].join('')
    }

    let cachedDefaultSkin = ''
    function defaultSkinUrl() {
      if (!cachedDefaultSkin) cachedDefaultSkin = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(defaultSkinSvg())
      return cachedDefaultSkin
    }

    /* ------------------------------------------------------------------ *
     * 1. 小工具
     * ------------------------------------------------------------------ */

    function str(value) {
      return typeof value === 'string' ? value : value === undefined || value === null ? '' : String(value)
    }

    function codePoints(value) {
      return Array.from(str(value)).length
    }

    function formatNumber(value) {
      const n = Number(value)
      return Number.isFinite(n) ? n.toLocaleString('zh-CN') : '--'
    }

    function formatDate(ms) {
      if (!ms) return ''
      const date = new Date(Number(ms))
      if (Number.isNaN(date.getTime())) return ''
      const pad = n => String(n).padStart(2, '0')
      return date.getFullYear() + '.' + pad(date.getMonth() + 1) + '.' + pad(date.getDate())
    }

    function formatCompactDate(ms) {
      if (!ms) return ''
      const date = new Date(Number(ms))
      if (Number.isNaN(date.getTime())) return ''
      const pad = n => String(n).padStart(2, '0')
      return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
    }

    function tierOf(turns) {
      const n = Number(turns) || 0
      return TIERS.find(tier => n >= tier.n) || null
    }

    /** 下一枚还没拿到的徽章（从低到高找第一个没达到的）。 */
    function nextTierOf(turns) {
      const n = Number(turns) || 0
      return [...TIERS].sort((a, b) => a.n - b.n).find(tier => n < tier.n) || null
    }

    /**
     * 成就进度的文案模型。
     * 还没拿到徽章：小字「下一成就 · X」，大字「还差 N 轮！」；
     * 已经拿到徽章（徽章弹出）：小字「当前成就 · X」，大字「已达成 N 轮成就！」；
     * 拿到最高档：小字「最高成就 · 不朽传说」，大字「已达成 N 轮成就！」。
     */
    function progressModel(turns) {
      const n = Math.max(0, Number(turns) || 0)
      const tier = tierOf(n)
      const next = nextTierOf(n)
      if (tier) {
        const label = next ? '当前成就 · ' + tier.label : '最高成就 · ' + tier.label
        return { label, prefix: '已达成 ', number: String(tier.n), suffix: ' 轮成就！' }
      }
      const gap = next ? Math.max(0, next.n - n) : 0
      return { label: next ? '下一成就 · ' + next.label : '最高成就 · 不朽传说', prefix: '还差 ', number: String(gap), suffix: ' 轮！' }
    }

    const PROGRESS_TRACKING = '-0.5px'

    // jsdom 等没有 2d context 的环境用估算宽度兜底，真实浏览器一律 measureText。
    let measureCanvas
    function measuringContext() {
      if (measureCanvas === undefined) {
        try {
          const canvas = document.createElement('canvas')
          measureCanvas = canvas.getContext('2d') || null
        } catch (error) {
          measureCanvas = null
        }
      }
      return measureCanvas
    }

    function estimateTextWidth(text, size) {
      let width = 0
      for (const char of Array.from(str(text))) {
        if (/[\u2e80-\u9fff\uff00-\uffef]/.test(char)) width += size
        else if (char === ' ') width += size * 0.28
        else width += size * 0.56
      }
      return width
    }

    function measureProgress(model, size) {
      const numberSize = Math.round(size * 1.3)
      const measure = measuringContext()
      if (measure && 'letterSpacing' in measure) measure.letterSpacing = PROGRESS_TRACKING
      const widthOf = (text, px) => {
        if (!measure) return estimateTextWidth(text, px) - Array.from(str(text)).length * 0.5
        measure.font = '900 ' + px + 'px ' + FONT_STACK
        return measure.measureText(text).width
      }
      const parts = {
        prefix: widthOf(model.prefix, size),
        number: widthOf(model.number, numberSize),
        suffix: widthOf(model.suffix, size),
      }
      return { size, numberSize, parts, width: parts.prefix + parts.number + parts.suffix }
    }

    /** 字号自适应：从 base 往下一路试，直到整行塞进 maxWidth，绝不截断。 */
    function fitProgress(model, maxWidth, base) {
      let size = Math.round(base)
      let fit = measureProgress(model, size)
      while (fit.width > maxWidth && size > 15) {
        size -= 1
        fit = measureProgress(model, size)
      }
      return fit
    }

    function layoutProgress(model, fit) {
      const rows = [
        ['prefix', model.prefix, fit.size],
        ['number', model.number, fit.numberSize],
        ['suffix', model.suffix, fit.size],
      ]
      let x = -fit.width / 2
      return rows.map(([key, text, size]) => {
        const row = { key, text, size, x }
        x += fit.parts[key]
        return row
      })
    }

    function escapeXml(value) {
      return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }

    // 屏幕上用 SVG 画：描边 / 投影 / 旋转与 canvas 用同一组数值，导出与屏幕一致。
    function progressSvg(model, fit) {
      const rows = layoutProgress(model, fit)
      const text = (row, attrs) => '<text x="' + (190 + row.x).toFixed(2) + '" y="31" font-size="' + row.size
        + '" font-family=\'' + FONT_STACK + '\' font-weight="900" letter-spacing="-0.5" text-anchor="start" ' + attrs + '>'
        + escapeXml(row.text) + '</text>'
      const layers = []
      for (const [dx, dy, alpha] of [[3, 3.5, .5], [2.1, 4.8, .38], [4.2, 2.2, .32]]) {
        for (const row of rows) {
          layers.push(text(row, 'fill="#5E3A28" fill-opacity="' + alpha + '" transform="translate(' + dx + ' ' + dy + ')"'))
        }
      }
      for (const row of rows) layers.push(text(row, 'fill="#5E3A28" stroke="#5E3A28" stroke-width="7" stroke-linejoin="round"'))
      const number = rows.find(row => row.key === 'number')
      if (number) layers.push(text(number, 'fill="none" stroke="#F4B942" stroke-width="3.4" stroke-linejoin="round"'))
      for (const row of rows) layers.push(text(row, 'fill="#ffffff"'))
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 40" width="380" height="40" role="img" aria-label="'
        + escapeXml(model.prefix + model.number + model.suffix) + '"><g transform="rotate(-4 190 20)">'
        + layers.join('') + '</g></svg>'
    }

    function buildProgress(turns) {
      const model = progressModel(turns)
      const fit = fitProgress(model, 372, 30)
      const block = el('div', { class: 'am-progress', 'data-progress': model.prefix + model.number + model.suffix })
      block.append(el('div', { class: 'am-progress-label', text: model.label }))
      block.append(el('div', { class: 'am-progress-big', html: progressSvg(model, fit) }))
      return block
    }

    /** canvas 版：同一套坐标、同一套描边与投影。 */
    function drawProgress(ctx, turns) {
      const model = progressModel(turns)
      const fit = fitProgress(model, 372, 30)
      const rows = layoutProgress(model, fit)

      ctx.save()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(255,255,255,.86)'
      ctx.font = '600 10px ' + FONT_STACK
      ctx.fillText(model.label, 210, 441)
      ctx.restore()

      ctx.save()
      ctx.translate(210, 468)
      ctx.rotate(-4 * Math.PI / 180)
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.lineJoin = 'round'
      ctx.miterLimit = 2
      if ('letterSpacing' in ctx) ctx.letterSpacing = PROGRESS_TRACKING
      const setFont = row => { ctx.font = '900 ' + row.size + 'px ' + FONT_STACK }
      const baseline = 11

      // 三层偏移投影
      for (const [dx, dy, alpha] of [[3, 3.5, .5], [2.1, 4.8, .38], [4.2, 2.2, .32]]) {
        ctx.fillStyle = 'rgba(94,58,40,' + alpha + ')'
        for (const row of rows) {
          setFont(row)
          ctx.fillText(row.text, row.x + dx, baseline + dy)
        }
      }
      // 栗子棕实心描边
      ctx.fillStyle = '#5E3A28'
      ctx.strokeStyle = '#5E3A28'
      ctx.lineWidth = 7
      for (const row of rows) {
        setFont(row)
        ctx.strokeText(row.text, row.x, baseline)
        ctx.fillText(row.text, row.x, baseline)
      }
      // 数字的蜜糖金描边
      const number = rows.find(row => row.key === 'number')
      if (number) {
        setFont(number)
        ctx.strokeStyle = '#F4B942'
        ctx.lineWidth = 3.4
        ctx.strokeText(number.text, number.x, baseline)
      }
      // 白色字面
      ctx.fillStyle = '#ffffff'
      for (const row of rows) {
        setFont(row)
        ctx.fillText(row.text, row.x, baseline)
      }
      ctx.restore()
    }

    function safeFileName(name) {
      return str(name).replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, '_').slice(0, 40) || '冒险者'
    }

    function el(tag, attrs, ...children) {
      const node = document.createElement(tag)
      if (attrs && typeof attrs === 'object') {
        for (const [key, value] of Object.entries(attrs)) {
          if (value === undefined || value === null || value === false) continue
          if (key === 'class') node.className = value
          else if (key === 'text') node.textContent = value
          else if (key === 'html') node.innerHTML = value // 仅限本文件内的静态 SVG
          else if (key === 'style' && typeof value === 'object') {
            for (const [prop, propValue] of Object.entries(value)) {
              if (prop.startsWith('--')) node.style.setProperty(prop, String(propValue))
              else node.style[prop] = propValue
            }
          }
          else if (key === 'dataset' && typeof value === 'object') Object.assign(node.dataset, value)
          else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value)
          else node.setAttribute(key, value === true ? '' : String(value))
        }
      }
      for (const child of children.flat(Infinity)) {
        if (child === undefined || child === null || child === false) continue
        node.append(child instanceof Node ? child : document.createTextNode(String(child)))
      }
      return node
    }

    function iconSvg(markup, className) {
      return el('span', { class: className || 'am-icon', html: markup, 'aria-hidden': 'true' })
    }

    function svgDataUrl(markup) {
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup)
    }

    function iconDataUrl(markup) {
      return svgDataUrl(String(markup).replace('<svg ', '<svg width="16" height="16" '))
    }

    function loadImage(src) {
      return new Promise((resolve, reject) => {
        const image = new Image()
        image.decoding = 'async'
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error('图片读不出来'))
        image.src = src
      })
    }

    function focusableWithin(node) {
      return Array.from(node.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter(item => !item.disabled && item.getClientRects().length > 0)
    }

    function firstChar(name) {
      return Array.from(str(name).replace(/^[^\p{L}\p{N}]+/u, ''))[0] || '?'
    }

    /* ------------------------------------------------------------------ *
     * 2. 皮肤存储（以后换 savePluginData 时只改这四个函数）
     * ------------------------------------------------------------------ */

    function loadSkins() {
      try {
        const raw = window.localStorage.getItem(SKINS_KEY)
        if (!raw) return []
        const list = JSON.parse(raw)
        if (!Array.isArray(list)) return []
        return list.filter(item => item && typeof item.id === 'string' && typeof item.dataUrl === 'string' && item.dataUrl.startsWith('data:image/'))
      } catch (error) {
        return []
      }
    }

    function saveSkins(list) {
      window.localStorage.setItem(SKINS_KEY, JSON.stringify(list))
    }

    function deleteSkin(id) {
      const list = loadSkins().filter(item => item.id !== id)
      saveSkins(list)
      return list
    }

    function readSelectedSkinId() {
      try {
        const id = window.localStorage.getItem(SELECTED_KEY)
        return typeof id === 'string' && id ? id : DEFAULT_SKIN_ID
      } catch (error) {
        return DEFAULT_SKIN_ID
      }
    }

    function writeSelectedSkinId(id) {
      try {
        window.localStorage.setItem(SELECTED_KEY, id)
      } catch (error) {
        // 选择失败不影响使用；下次打开回到默认皮肤。
      }
    }

    function skinListWithDefault(skins) {
      return [{ id: DEFAULT_SKIN_ID, name: '内置奶油冒险者', dataUrl: defaultSkinUrl(), builtin: true, bytes: 0 }, ...skins]
    }

    function skinUrlOf(id, skins) {
      if (id === DEFAULT_SKIN_ID) return defaultSkinUrl()
      const found = skins.find(item => item.id === id)
      return found ? found.dataUrl : defaultSkinUrl()
    }

    /* ------------------------------------------------------------------ *
     * 3. 覆盖层会话
     * ------------------------------------------------------------------ */

    let activeSession = null
    let activeStyle = null

    function installStyles() {
      if (activeStyle && activeStyle.isConnected) return activeStyle
      const style = document.createElement('style')
      style.dataset.adventureMedal = '1'
      style.textContent = CSS_TEXT
      document.head.append(style)
      activeStyle = style
      return style
    }

    function removeStyles() {
      if (activeStyle) {
        activeStyle.remove()
        activeStyle = null
      }
    }

    function openOverlay(ctx, sessionId) {
      if (activeSession) activeSession.close()
      const session = createSession(ctx, str(sessionId))
      activeSession = session
      return session
    }

    function createSession(ctx, sessionId) {
      const ui = ctx.tavernUi
      const root = el('div', { class: 'am-root', role: 'dialog', 'aria-modal': 'true', 'aria-label': '冒险奖牌' })
      const layerHost = el('div', { class: 'am-layer-host' })
      const selectorHost = el('div', { class: 'am-selector-host' })
      root.append(selectorHost, layerHost)
      document.body.append(root)
      installStyles()
      root.addEventListener('pointerdown', event => {
        if (event.target === root) close()
      })

      const previousOverflow = document.body.style.overflow
      const previousFocus = document.activeElement
      document.body.style.overflow = 'hidden'

      const state = {
        sessionId,
        screen: 'cards',
        loading: true,
        error: '',
        cards: [],
        current: null,
        selectedCard: null,
        countsLoading: false,
        skins: loadSkins(),
        selectedSkin: readSelectedSkinId(),
        medal: null,
        celebrated: new Set(),
        statsCache: new Map(),
        busy: null,
        toast: null,
        toastTimer: 0,
        scale: 1,
        closed: false,
      }

      function updateScale() {
        const widthScale = (window.innerWidth - 32) / DESIGN_W
        const heightScale = (window.innerHeight * 0.70) / DESIGN_H
        const scale = Math.max(0.62, Math.min(1, widthScale, heightScale))
        state.scale = scale
        root.style.setProperty('--am-scale', String(scale))
      }

      function focusFirst() {
        const top = topLayer()
        const target = top || selectorHost
        const preferred = target.querySelector('.am-current, .am-tile, .am-row, .am-save')
        if (preferred && typeof preferred.focus === 'function') {
          preferred.focus({ preventScroll: true })
          return
        }
        const list = focusableWithin(target)
        if (list.length) list[0].focus({ preventScroll: true })
      }

      function topLayer() {
        const layers = Array.from(layerHost.children)
        return layers.length ? layers[layers.length - 1] : null
      }

      function showToast(message, tone) {
        if (state.closed) return
        if (state.toast && state.toast.isConnected) state.toast.remove()
        if (state.toastTimer) window.clearTimeout(state.toastTimer)
        const toast = el('div', { class: 'am-toast am-toast-' + (tone || 'error'), role: 'alert' },
          iconSvg(tone === 'success' ? ICON_CHECK : ICON_SPARK, 'am-toast-icon'),
          el('span', { text: str(message) }),
        )
        root.append(toast)
        state.toast = toast
        state.toastTimer = window.setTimeout(() => {
          if (toast.isConnected) toast.remove()
          if (state.toast === toast) state.toast = null
        }, 4200)
      }

      function showBusy(message) {
        hideBusy()
        const busy = el('div', { class: 'am-busy', role: 'status', 'aria-live': 'polite' },
          el('div', { class: 'am-busy-inner' },
            iconSvg(ICON_MEDAL_LAUNCHER, 'am-busy-icon'),
            el('span', { text: str(message) || '正在翻阅冒险记录…' }),
          ),
        )
        root.append(busy)
        state.busy = busy
      }

      function hideBusy() {
        if (state.busy) {
          state.busy.remove()
          state.busy = null
        }
      }

      async function hostCall(name, args) {
        if (!ui || typeof ui.callHost !== 'function') throw new Error('当前酒馆版本不支持插件界面通信')
        return await ui.callHost(name, args || {})
      }

      function friendlyListError(error) {
        const message = str(error && error.message)
        if (/NOT_FOUND|不存在/.test(message)) return '酒馆的冒险名册暂时打不开，刷新页面再试试？'
        return '酒馆的冒险名册暂时打不开，稍后再试试？'
      }

      function friendlyStatsError(error) {
        const message = str(error && error.message)
        if (/HISTORY|正文/.test(message)) return '这段冒险的正文暂时读不出来，换一份试试？'
        return '这份存档好像被施了混淆魔法，换一份试试？'
      }

      async function loadList() {
        state.loading = true
        state.error = ''
        state.screen = 'cards'
        renderSelector()
        try {
          const payload = await hostCall(HOST.list, { sessionId: state.sessionId })
          if (state.closed) return
          state.cards = Array.isArray(payload && payload.cards) ? payload.cards : []
          state.current = payload && payload.current ? payload.current : null
          state.loading = false
          renderSelector()
          focusFirst()
        } catch (error) {
          if (state.closed) return
          state.loading = false
          state.error = friendlyListError(error)
          renderSelector()
        }
      }

      function renderSelector() {
        selectorHost.replaceChildren()
        if (state.loading) {
          selectorHost.append(renderPanelLoading())
          return
        }
        if (state.error) {
          selectorHost.append(renderPanelError(state.error))
          return
        }
        if (state.screen === 'chats' && state.selectedCard) {
          selectorHost.append(renderChatsPanel(state.selectedCard))
        } else {
          selectorHost.append(renderCardsPanel())
        }
      }

      function renderPanelLoading() {
        return el('div', { class: 'am-panel am-panel-loading' },
          el('div', { class: 'am-loading' },
            iconSvg(ICON_MEDAL_LAUNCHER, 'am-spinner'),
            el('p', { text: '正在翻阅冒险记录…' }),
          ),
          el('button', { class: 'am-icon-btn am-panel-corner', type: 'button', 'aria-label': '关闭', onClick: close }, iconSvg(ICON_CLOSE, 'am-icon')),
        )
      }

      function renderPanelError(message) {
        return el('div', { class: 'am-panel' },
          el('div', { class: 'am-head' },
            el('div', { class: 'am-brand' },
              el('span', { class: 'am-brand-mark' }, iconSvg(ICON_MEDAL_LAUNCHER, 'am-brand-icon')),
              el('div', null, el('div', { class: 'am-title', text: '冒险者公会' }), el('div', { class: 'am-sub', text: '奖牌颁发处' })),
            ),
            el('div', { class: 'am-head-actions' },
              el('button', { class: 'am-icon-btn', type: 'button', 'aria-label': '关闭', onClick: close }, iconSvg(ICON_CLOSE, 'am-icon')),
            ),
          ),
          el('div', { class: 'am-empty' },
            iconSvg(ICON_MEDAL_LAUNCHER, 'am-empty-mark'),
            el('h3', { text: '名册被迷雾遮住了' }),
            el('p', { text: message }),
            el('div', { class: 'am-empty-actions' },
              el('button', { class: 'am-btn am-btn-primary', type: 'button', onClick: loadList }, '再试一次'),
            ),
          ),
        )
      }

      function headerBrand() {
        return el('div', { class: 'am-brand' },
          el('span', { class: 'am-brand-mark' }, iconSvg(ICON_MEDAL_LAUNCHER, 'am-brand-icon')),
          el('div', null,
            el('div', { class: 'am-title', text: '冒险者公会' }),
            el('div', { class: 'am-sub', text: '挑一段冒险，领一枚奖牌' }),
          ),
        )
      }

      function headerActions(back) {
        return el('div', { class: 'am-head-actions' },
          back ? el('button', { class: 'am-icon-btn', type: 'button', 'aria-label': '返回角色卡', onClick: () => { state.screen = 'cards'; renderSelector(); focusFirst() } }, iconSvg(ICON_ARROW_LEFT, 'am-icon')) : null,
          el('button', { class: 'am-icon-btn', type: 'button', 'aria-label': '更换皮肤', title: '更换皮肤', onClick: pickSkins }, iconSvg(ICON_PALETTE, 'am-icon')),
          el('button', { class: 'am-icon-btn', type: 'button', 'aria-label': '关闭', onClick: close }, iconSvg(ICON_CLOSE, 'am-icon')),
        )
      }

      function renderCardsPanel() {
        const panel = el('div', { class: 'am-panel' })
        panel.append(el('div', { class: 'am-head' }, headerBrand(), headerActions(false)))
        const body = el('div', { class: 'am-body am-step' })

        const current = buildCurrentShortcut()
        if (current) body.append(current)

        if (!state.cards.length) {
          body.append(el('div', { class: 'am-empty' },
            iconSvg(ICON_MEDAL_LAUNCHER, 'am-empty-mark'),
            el('h3', { text: '还没有角色卡' }),
            el('p', { text: '先在酒馆里导入一张人物卡，再来领取奖牌吧。' }),
          ))
        } else {
          const grid = el('div', { class: 'am-grid' })
          for (const card of state.cards) {
            grid.append(renderCardTile(card))
          }
          body.append(grid)
        }

        body.append(el('div', { class: 'am-note', text: '只读取本机酒馆数据 · 不会上传任何内容' }))
        if (state.skins.length) {
          body.append(el('button', { class: 'am-link', type: 'button', onClick: () => openManager(null) }, '管理皮肤'))
        }
        panel.append(body)
        return panel
      }

      function buildCurrentShortcut() {
        if (!state.current) return null
        return el('button', { class: 'am-current', type: 'button', onClick: () => openStats(state.current, null) },
          el('span', { class: 'am-current-icon' }, iconSvg(ICON_SPARK, 'am-icon')),
          el('span', { class: 'am-current-main' },
            el('span', { class: 'am-current-title', text: '✨ 当前冒险' }),
            el('span', { class: 'am-current-sub', text: state.current.cardName + ' · ' + (state.current.turnCountExact ? '' : '≈') + (state.current.turnCount || 0) + ' 轮' }),
          ),
          el('span', { class: 'am-current-arrow', text: '›' }),
        )
      }

      function renderCardTile(card) {
        const tile = el('button', {
          class: 'am-tile' + (card.chats && card.chats.length ? '' : ' is-empty'),
          type: 'button',
          title: card.name,
          onClick: () => selectCard(card),
        })
        tile.append(el('span', { class: 'am-tile-placeholder', text: firstChar(card.name) }))
        if (card.imageUrl) {
          tile.append(el('img', { src: card.imageUrl, alt: '', loading: 'lazy', onError: event => { event.currentTarget.style.display = 'none' } }))
        }
        tile.append(el('span', { class: 'am-tile-shade' }))
        if (card.chats && card.chats.length) {
          tile.append(el('span', { class: 'am-tile-count', text: String(card.chats.length) }))
        }
        tile.append(el('span', { class: 'am-tile-meta', text: card.chats && card.chats.length ? formatDate(card.lastPlayedAt) : '暂无存档' }))
        tile.append(el('span', { class: 'am-tile-name', text: card.name }))
        return tile
      }

      function renderChatsPanel(card) {
        const panel = el('div', { class: 'am-panel' })
        panel.append(el('div', { class: 'am-head' },
          headerBrand(),
          headerActions(true),
        ))
        const body = el('div', { class: 'am-body am-step' })
        const current = buildCurrentShortcut()
        if (current) body.append(current)
        body.append(el('div', { class: 'am-subhead' },
          el('span', { class: 'am-subhead-title', text: card.name }),
          el('span', { class: 'am-subhead-count', text: (card.chats ? card.chats.length : 0) + ' 段冒险' + (state.countsLoading ? ' · 统计中…' : '') }),
        ))

        if (!card.chats || !card.chats.length) {
          body.append(el('div', { class: 'am-empty' },
            iconSvg(ICON_MEDAL_LAUNCHER, 'am-empty-mark'),
            el('h3', { text: '这张卡还没有冒险存档哦' }),
            el('p', { text: '回到酒馆，和这张卡开始一段冒险，再回来领取奖牌吧。' }),
          ))
        } else {
          const list = el('div', { class: 'am-list' })
          for (const chat of card.chats) {
            list.append(renderChatRow(chat, card))
          }
          body.append(list)
        }
        body.append(el('div', { class: 'am-note', text: '按最后游玩时间排序' }))
        if (state.skins.length) {
          body.append(el('button', { class: 'am-link', type: 'button', onClick: () => openManager(null) }, '管理皮肤'))
        }
        panel.append(body)
        return panel
      }

      function renderChatRow(chat, card) {
        const row = el('button', { class: 'am-row', type: 'button', title: chat.title, onClick: () => openStats(chat, card) })
        const thumb = el('span', { class: 'am-row-thumb' })
        if (card.imageUrl) {
          thumb.append(el('img', {
            src: card.imageUrl,
            alt: '',
            loading: 'lazy',
            onError: event => {
              event.currentTarget.remove()
              thumb.textContent = firstChar(card.name)
            },
          }))
        } else thumb.append(el('span', { text: firstChar(card.name) }))
        row.append(thumb)
        row.append(el('span', { class: 'am-row-main' },
          el('span', { class: 'am-row-title', text: chat.title || card.name }),
          el('span', { class: 'am-row-meta', text: formatDate(chat.lastOpenedAt) + (chat.previewText ? ' · ' + chat.previewText : '') }),
        ))
        const pendingCount = state.countsLoading && !chat.turnCountExact
        row.append(el('span', { class: 'am-row-turn' },
          el('b', { text: pendingCount ? '…' : (chat.turnCountExact ? '' : '≈') + String(chat.turnCount || 0) }),
          el('span', { text: '轮' }),
        ))
        return row
      }

      function selectCard(card) {
        state.selectedCard = card
        state.screen = 'chats'
        state.countsLoading = Boolean(card.chats && card.chats.length)
        renderSelector()
        focusFirst()
        if (state.countsLoading) loadCounts(card)
      }

      async function loadCounts(card) {
        const ids = (card.chats || []).map(chat => chat.chatId).filter(Boolean)
        if (!ids.length) {
          state.countsLoading = false
          return
        }
        try {
          const counts = await hostCall(HOST.counts, { chatIds: ids })
          for (const chat of card.chats) {
            const row = counts && counts[chat.chatId]
            if (row) {
              chat.turnCount = Math.max(0, Number(row.turnCount) || 0)
              chat.messageCount = Math.max(0, Number(row.messageCount) || 0)
              chat.turnCountExact = true
              if (state.current && state.current.chatId === chat.chatId) {
                state.current.turnCount = chat.turnCount
                state.current.messageCount = chat.messageCount
                state.current.turnCountExact = true
              }
            }
          }
        } catch (error) {
          // 读不到完整 chat 时保留 index.json 的预览值，并用 ≈ 标出。
        }
        if (state.closed) return
        state.countsLoading = false
        if (state.screen === 'chats' && state.selectedCard === card) renderSelector()
      }

      async function openStats(chat, card) {
        if (!chat) return
        const chosenCard = card || state.cards.find(item => item.id === chat.cardId || (item.chats || []).some(itemChat => itemChat.chatId === chat.chatId)) || {
          id: chat.cardId || chat.cardName,
          name: chat.cardName || chat.title || '未命名角色',
          imageUrl: '',
          chats: [chat],
        }
        const chats = Array.isArray(chosenCard.chats) && chosenCard.chats.length ? chosenCard.chats : [chat]
        const index = Math.max(0, chats.findIndex(item => item.chatId === chat.chatId))
        state.selectedCard = chosenCard
        showBusy('正在翻阅这段冒险…')
        try {
          let stats = state.statsCache.get(chat.chatId)
          if (!stats) {
            stats = await hostCall(HOST.stats, { sessionId: chat.sessionId, chatId: chat.chatId })
            state.statsCache.set(chat.chatId, stats)
          }
          if (state.closed) return
          hideBusy()
          openMedal(stats, chosenCard, chats, index)
          if (stats.warning) showToast(stats.warning)
        } catch (error) {
          hideBusy()
          showToast(friendlyStatsError(error))
        }
      }

      function openMedal(stats, card, chats, index) {
        closeMedal(true)
        state.medal = {
          stats,
          card,
          chats,
          index,
          date: formatDate(Date.now()),
        }
        const layer = el('div', { class: 'am-medal-layer' })
        layer.addEventListener('pointerdown', event => {
          if (event.target === layer) closeMedal('chats')
        })
        layerHost.append(layer)
        renderMedal(layer, false)
        window.requestAnimationFrame(() => focusFirst())
      }

      function renderMedal(layer, preserveSheet) {
        const medal = state.medal
        if (!medal) return
        const existingSheet = preserveSheet && layer.querySelector('.am-sheet') ? layer.querySelector('.am-sheet') : null
        if (existingSheet) {
          const oldWrap = existingSheet.querySelector('.am-card-wrap')
          const newWrap = buildCardWrap(medal)
          if (oldWrap) oldWrap.replaceWith(newWrap)
          bindMedalButtons(existingSheet)
          animateNumbers(newWrap, medal)
          return
        }
        layer.replaceChildren()
        const sheet = el('div', { class: 'am-sheet' })
        sheet.append(el('div', { class: 'am-sheet-head' },
          el('button', { class: 'am-ghost-btn', type: 'button', onClick: () => closeMedal('chats') }, iconSvg(ICON_ARROW_LEFT, 'am-ghost-icon'), '返回'),
          el('button', { class: 'am-ghost-btn am-ghost-close', type: 'button', 'aria-label': '关闭奖牌', onClick: () => closeMedal('chats') }, iconSvg(ICON_CLOSE, 'am-ghost-icon')),
        ))
        sheet.append(buildCardWrap(medal))
        sheet.append(el('div', { class: 'am-actions' },
          el('button', { class: 'am-btn am-btn-primary am-save', type: 'button' }, iconSvg(ICON_DOWNLOAD, 'am-btn-icon'), '保存奖牌图片'),
          el('button', { class: 'am-btn am-btn-secondary am-again', type: 'button' }, iconSvg(ICON_SPARK, 'am-btn-icon'), '再来一枚'),
        ))
        layer.append(sheet)
        bindMedalButtons(sheet)
        animateNumbers(sheet, medal)
      }

      function bindMedalButtons(sheet) {
        const save = sheet.querySelector('.am-save')
        if (save) save.onclick = saveMedal
        const again = sheet.querySelector('.am-again')
        if (again) again.onclick = () => closeMedal('chats')
      }

      function buildCardWrap(medal) {
        const wrap = el('div', { class: 'am-card-wrap' })
        const card = el('div', { class: 'am-card' })
        const skinId = state.selectedSkin
        const skinUrl = skinUrlOf(skinId, state.skins)
        const skinA = el('img', { class: 'am-skin am-skin-a is-visible', src: skinUrl, alt: '' })
        const skinB = el('img', { class: 'am-skin am-skin-b', src: skinUrl, alt: '' })
        card.dataset.skinLayer = 'a'
        card.append(skinA, skinB)
        card.append(el('div', { class: 'am-shade' }))
        card.append(el('div', { class: 'am-left-scrim' }))
        card.append(el('div', { class: 'am-content-scrim' }))

        // 存档切换（顶部）
        if (medal.chats.length > 1) {
          const arch = el('div', { class: 'am-arch' })
          arch.append(el('button', { class: 'am-arch-btn', type: 'button', 'aria-label': '上一段冒险', onClick: () => switchMedal(medal.index - 1) }, iconSvg(ICON_ARROW_LEFT, 'am-arch-icon')))
          medal.chats.forEach((chat, index) => {
            arch.append(el('button', {
              class: 'am-arch-dot' + (index === medal.index ? ' is-active' : ''),
              type: 'button',
              'aria-label': '第 ' + (index + 1) + ' 段冒险',
              onClick: () => switchMedal(index),
            }, el('span', { class: 'am-dot' })))
          })
          arch.append(el('button', { class: 'am-arch-btn', type: 'button', 'aria-label': '下一段冒险', onClick: () => switchMedal(medal.index + 1) }, iconSvg(ICON_ARROW_RIGHT, 'am-arch-icon')))
          card.append(arch)
        }

        // 竖排标语
        card.append(el('div', { class: 'am-slogan', text: SLOGAN }))

        // 勋章 + 星星
        const medalBox = el('div', { class: 'am-medal' },
          el('div', { class: 'am-medal-drop' },
            el('div', { class: 'am-medal-settle' },
              el('div', { class: 'am-medal-sway', html: MEDAL_SVG }),
            ),
          ),
        )
        card.append(medalBox)
        const starPositions = [
          [130, 120, 8, '#F4B942', 0], [282, 104, 6, '#FF9EBB', .5], [300, 190, 7, '#9FE2BF', 1.1],
          [118, 205, 5, '#FF9EBB', .8], [150, 76, 5, '#9FE2BF', 1.5], [270, 150, 5, '#F4B942', 1.9],
        ]
        for (const [x, y, size, color, delay] of starPositions) {
          card.append(el('span', {
            class: 'am-star',
            style: { left: x + 'px', top: y + 'px', width: size + 'px', height: size + 'px', color, animationDelay: delay + 's' },
            html: ICON_STAR4,
          }))
        }

        // 成就
        const tier = tierOf(medal.stats.turnCount)
        if (tier) {
          const badge = el('div', { class: 'am-badge am-badge-' + tier.key, title: tier.label + ' · ' + tier.n + ' 轮' },
            el('span', { class: 'am-badge-art', html: badgeSvg(tier.key) }),
            el('span', { class: 'am-badge-num' + (String(tier.n).length >= 4 ? ' is-long' : ''), text: String(tier.n) }),
          )
          card.append(badge)
          card.append(el('div', { class: 'am-ribbon' },
            el('b', { text: tier.label }),
            el('span', { text: '恭喜你达成了' + tier.n + '轮的成就！' }),
          ))
          if (!state.celebrated.has(medal.stats.chatId)) {
            state.celebrated.add(medal.stats.chatId)
            card.append(buildConfetti(tier))
          }
        }

        // 四个毛玻璃胶囊
        const pills = el('div', { class: 'am-pills' })
        pills.append(buildPill(ICON_PERSON, '冒险者', medal.stats.cardName, medal.stats.cardName, false))
        pills.append(buildPill(ICON_DICE, '冒险轮数', medal.stats.turnCount || 0, null, true))
        pills.append(buildPill(ICON_BOOK, '酒馆记忆', medal.stats.contextChars || 0, null, true, ' 字'))
        pills.append(buildPill(ICON_CALENDAR, '开始冒险', formatDate(medal.stats.createdAt) || '--', null, false))
        card.append(pills)

        // 成就进度
        card.append(buildProgress(medal.stats.turnCount))

        // 皮肤圆点（底部）
        const allSkins = skinListWithDefault(state.skins)
        if (allSkins.length > 1) {
          const dots = el('div', { class: 'am-skins' })
          for (const skin of allSkins) {
            dots.append(el('button', {
              class: 'am-skin-dot' + (skin.id === state.selectedSkin ? ' is-active' : ''),
              type: 'button',
              'aria-label': '皮肤：' + skin.name,
              onClick: () => selectSkin(skin.id, card),
            }, el('span', null)))
          }
          card.append(dots)
        }

        card.append(el('div', { class: 'am-footer', text: 'DSHTavern 冒险纪念 · ' + medal.date }))
        wrap.append(card)
        return wrap
      }

      function buildPill(icon, label, value, title, animate, suffix) {
        // animate 时 value 必须是原始数字（count-up 会自己 formatNumber），否则带千分位会被 Number() 读成 NaN。
        const valueEl = el('span', { class: 'am-pill-value', text: animate ? '0' + (suffix || '') : value })
        if (title) valueEl.title = title
        if (animate) {
          valueEl.dataset.count = String(Math.round(Number(value) || 0))
          if (suffix) valueEl.dataset.suffix = suffix
        }
        return el('div', { class: 'am-pill' },
          iconSvg(icon, 'am-pill-icon'),
          el('span', { class: 'am-pill-label', text: label }),
          valueEl,
        )
      }

      function buildConfetti(tier) {
        const palette = tier.key === 'rainbow'
          ? ['#FF9EBB', '#F4B942', '#9FE2BF', '#8EC5FF', '#C9A6FF']
          : tier.key === 'gold'
            ? ['#F4B942', '#FFE08A', '#FF9EBB']
            : tier.key === 'silver'
              ? ['#C9CED6', '#E8ECF2', '#9FE2BF']
              : ['#C98A5A', '#E0A070', '#F4B942']
        const layer = el('div', { class: 'am-confetti' })
        for (let i = 0; i < 24; i += 1) {
          const color = palette[i % palette.length]
          layer.append(el('span', {
            class: 'am-confetti-piece',
            style: {
              left: (170 + Math.random() * 80) + 'px',
              top: (130 + Math.random() * 40) + 'px',
              width: (5 + Math.random() * 5) + 'px',
              height: (7 + Math.random() * 6) + 'px',
              background: color,
              animationDelay: (Math.random() * 0.25) + 's',
              '--am-dx': ((Math.random() - 0.5) * 180) + 'px',
              '--am-rot': ((Math.random() - 0.5) * 720) + 'deg',
            },
          }))
        }
        return layer
      }

      function animateNumbers(scope, medal) {
        if (!scope) return
        const suffixOf = node => node.dataset.suffix || ''
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          for (const node of scope.querySelectorAll('[data-count]')) node.textContent = formatNumber(node.dataset.count) + suffixOf(node)
          return
        }
        const token = (scope.__amToken || 0) + 1
        scope.__amToken = token
        for (const node of scope.querySelectorAll('[data-count]')) {
          const target = Number(node.dataset.count) || 0
          const start = performance.now()
          const duration = 900
          const tick = now => {
            if (scope.__amToken !== token || !node.isConnected) return
            const progress = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - progress, 3)
            node.textContent = formatNumber(Math.round(target * eased)) + suffixOf(node)
            if (progress < 1) window.requestAnimationFrame(tick)
            else node.textContent = formatNumber(target) + suffixOf(node)
          }
          window.requestAnimationFrame(tick)
        }
      }

      async function switchMedal(index) {
        const medal = state.medal
        if (!medal || index < 0 || index >= medal.chats.length || index === medal.index) return
        const chat = medal.chats[index]
        const previous = medal.index
        medal.index = index
        const layer = layerHost.querySelector('.am-medal-layer')
        if (!layer) return
        let stats = state.statsCache.get(chat.chatId)
        if (!stats) {
          showBusy('正在翻阅这段冒险…')
          try {
            stats = await hostCall(HOST.stats, { sessionId: chat.sessionId, chatId: chat.chatId })
            state.statsCache.set(chat.chatId, stats)
          } catch (error) {
            medal.index = previous
            hideBusy()
            showToast(friendlyStatsError(error))
            return
          }
          hideBusy()
        }
        if (!state.medal || state.closed) return
        state.medal.stats = stats
        const oldWrap = layer.querySelector('.am-card-wrap')
        if (oldWrap) {
          const newWrap = buildCardWrap(state.medal)
          newWrap.style.animation = 'am-fade .22s ease-out both'
          oldWrap.replaceWith(newWrap)
          animateNumbers(newWrap, state.medal)
        } else {
          renderMedal(layer, false)
        }
        if (stats.warning) showToast(stats.warning)
      }

      function selectSkin(id, card) {
        state.selectedSkin = id
        writeSelectedSkinId(id)
        const allSkins = skinListWithDefault(state.skins)
        const url = skinUrlOf(id, state.skins)
        if (card) {
          const a = card.querySelector('.am-skin-a')
          const b = card.querySelector('.am-skin-b')
          if (a && b) {
            const current = card.dataset.skinLayer === 'a' ? a : b
            const next = current === a ? b : a
            next.src = url
            next.classList.add('is-visible')
            current.classList.remove('is-visible')
            card.dataset.skinLayer = next === a ? 'a' : 'b'
          }
          for (const dot of card.querySelectorAll('.am-skin-dot')) {
            const skin = allSkins[Array.from(dot.parentElement.children).indexOf(dot)]
            dot.classList.toggle('is-active', Boolean(skin && skin.id === id))
          }
        }
      }

      function closeMedal(destination) {
        const layer = layerHost.querySelector('.am-medal-layer')
        state.medal = null
        if (!layer) {
          if (destination === 'cards') {
            state.screen = 'cards'
            renderSelector()
          } else if (destination === 'chats') {
            state.screen = 'chats'
            renderSelector()
          }
          return
        }
        const sheet = layer.querySelector('.am-sheet')
        if (sheet) sheet.classList.add('is-closing')
        window.setTimeout(() => {
          layer.remove()
          if (state.closed) return
          if (destination === 'cards') {
            state.screen = 'cards'
            renderSelector()
          } else if (destination === 'chats') {
            state.screen = 'chats'
            renderSelector()
          }
          focusFirst()
        }, 280)
      }

      async function saveMedal() {
        const medal = state.medal
        if (!medal) return
        const button = layerHost.querySelector('.am-save')
        if (button) {
          button.disabled = true
          button.classList.add('is-busy')
        }
        try {
          await exportMedal(medal)
          showToast('奖牌已经收好啦，去相册看看吧', 'success')
        } catch (error) {
          showToast('奖牌暂时画不出来，稍后再试试？')
        } finally {
          if (button && button.isConnected) {
            button.disabled = false
            button.classList.remove('is-busy')
          }
        }
      }

      function pickSkins() {
        const input = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', multiple: true, style: { display: 'none' } })
        input.addEventListener('change', () => {
          const files = Array.from(input.files || []).filter(file => /^image\/(jpeg|png|webp)$/.test(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name))
          input.remove()
          if (files.length) openCrop(files, 0)
        })
        document.body.append(input)
        input.click()
      }

      function openCrop(files, startIndex) {
        if (state.toast) {
          state.toast.remove()
          state.toast = null
        }
        const queue = files.slice()
        let index = Math.max(0, startIndex || 0)
        let currentUrl = ''
        const layer = el('div', { class: 'am-crop' })
        layerHost.append(layer)

        function cleanup() {
          if (currentUrl) URL.revokeObjectURL(currentUrl)
          currentUrl = ''
          layer.remove()
        }
        layer.__amCleanup = cleanup

        function next() {
          if (index >= queue.length) {
            cleanup()
            renderSelector()
            focusFirst()
            showToast('新皮肤已经换上啦', 'success')
            return
          }
          const file = queue[index]
          currentUrl = URL.createObjectURL(file)
          const image = new Image()
          image.onload = () => build(image, file)
          image.onerror = () => {
            URL.revokeObjectURL(currentUrl)
            currentUrl = ''
            showToast('这张图片读不出来，换一张试试？')
            index += 1
            next()
          }
          image.src = currentUrl
        }

        function build(image, file) {
          layer.replaceChildren()
          const frameWidth = Math.min(340, window.innerWidth * 0.78, window.innerHeight * 0.56)
          const frameHeight = frameWidth * 4 / 3
          const frame = el('div', { class: 'am-crop-frame', style: { width: frameWidth + 'px', height: frameHeight + 'px' } })
          const img = el('img', { class: 'am-crop-img', src: currentUrl, alt: '', draggable: 'false' })
          frame.append(img)
          const naturalW = image.naturalWidth || image.width || 1
          const naturalH = image.naturalHeight || image.height || 1
          img.style.width = naturalW + 'px'
          img.style.height = naturalH + 'px'
          const minScale = Math.max(frameWidth / naturalW, frameHeight / naturalH)
          const view = { s: minScale, tx: (frameWidth - naturalW * minScale) / 2, ty: (frameHeight - naturalH * minScale) / 2, minScale }
          const maxScale = minScale * 5

          function clamp() {
            view.s = Math.max(minScale, Math.min(maxScale, view.s))
            const scaledW = naturalW * view.s
            const scaledH = naturalH * view.s
            view.tx = Math.min(0, Math.max(frameWidth - scaledW, view.tx))
            view.ty = Math.min(0, Math.max(frameHeight - scaledH, view.ty))
            if (scaledW <= frameWidth) view.tx = (frameWidth - scaledW) / 2
            if (scaledH <= frameHeight) view.ty = (frameHeight - scaledH) / 2
          }

          function apply() {
            img.style.transform = 'translate(' + view.tx + 'px,' + view.ty + 'px) scale(' + view.s + ')'
          }

          clamp()
          apply()

          const pointers = new Map()
          let gesture = null
          function localPoint(event) {
            const rect = frame.getBoundingClientRect()
            return { x: event.clientX - rect.left, y: event.clientY - rect.top }
          }
          function startGesture() {
            if (pointers.size === 1) {
              const point = Array.from(pointers.values())[0]
              gesture = { type: 'drag', x: point.x, y: point.y, tx: view.tx, ty: view.ty }
            } else if (pointers.size >= 2) {
              const [a, b] = Array.from(pointers.values()).slice(0, 2)
              const distance = Math.hypot(a.x - b.x, a.y - b.y) || 1
              const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
              gesture = { type: 'pinch', distance, mid, s: view.s, tx: view.tx, ty: view.ty }
            }
          }
          frame.addEventListener('pointerdown', event => {
            event.preventDefault()
            frame.setPointerCapture(event.pointerId)
            pointers.set(event.pointerId, localPoint(event))
            startGesture()
          })
          frame.addEventListener('pointermove', event => {
            if (!pointers.has(event.pointerId)) return
            event.preventDefault()
            pointers.set(event.pointerId, localPoint(event))
            if (!gesture) return
            if (gesture.type === 'drag' && pointers.size === 1) {
              const point = Array.from(pointers.values())[0]
              view.tx = gesture.tx + (point.x - gesture.x)
              view.ty = gesture.ty + (point.y - gesture.y)
              clamp()
              apply()
            } else if (gesture.type === 'pinch' && pointers.size >= 2) {
              const [a, b] = Array.from(pointers.values()).slice(0, 2)
              const distance = Math.hypot(a.x - b.x, a.y - b.y) || 1
              const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
              const imgX = (gesture.mid.x - gesture.tx) / gesture.s
              const imgY = (gesture.mid.y - gesture.ty) / gesture.s
              view.s = Math.max(minScale, Math.min(maxScale, gesture.s * (distance / gesture.distance)))
              view.tx = mid.x - imgX * view.s
              view.ty = mid.y - imgY * view.s
              clamp()
              apply()
            }
          })
          const endPointer = event => {
            pointers.delete(event.pointerId)
            if (pointers.size === 0) gesture = null
            else startGesture()
          }
          frame.addEventListener('pointerup', endPointer)
          frame.addEventListener('pointercancel', endPointer)
          frame.addEventListener('wheel', event => {
            event.preventDefault()
            const point = localPoint(event)
            const factor = Math.exp(-event.deltaY * 0.0015)
            const imgX = (point.x - view.tx) / view.s
            const imgY = (point.y - view.ty) / view.s
            view.s = Math.max(minScale, Math.min(maxScale, view.s * factor))
            view.tx = point.x - imgX * view.s
            view.ty = point.y - imgY * view.s
            clamp()
            apply()
            slider.value = String(view.s / minScale)
          }, { passive: false })

          const slider = el('input', { class: 'am-crop-slider', type: 'range', min: '1', max: '5', step: '0.01', value: String(view.s / minScale), 'aria-label': '缩放图片' })
          slider.addEventListener('input', () => {
            const nextScale = minScale * Number(slider.value || 1)
            const cx = frameWidth / 2
            const cy = frameHeight / 2
            const imgX = (cx - view.tx) / view.s
            const imgY = (cy - view.ty) / view.s
            view.s = nextScale
            view.tx = cx - imgX * view.s
            view.ty = cy - imgY * view.s
            clamp()
            apply()
          })

          const header = el('div', { class: 'am-crop-head' },
            el('button', { class: 'am-ghost-btn', type: 'button', onClick: () => { cleanup(); focusFirst() } }, '取消'),
            el('div', { class: 'am-crop-title', text: '调整皮肤' }),
            el('div', { class: 'am-crop-count', text: '第 ' + (index + 1) + '/' + queue.length + ' 张' }),
          )

          const changeButton = el('button', { class: 'am-btn am-btn-secondary', type: 'button' }, '换一张')
          changeButton.addEventListener('click', () => {
            const input = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', style: { display: 'none' } })
            input.addEventListener('change', () => {
              const file2 = (input.files || [])[0]
              input.remove()
              if (!file2) return
              queue[index] = file2
              if (currentUrl) URL.revokeObjectURL(currentUrl)
              currentUrl = ''
              next()
            })
            document.body.append(input)
            input.click()
          })

          const confirmButton = el('button', { class: 'am-btn am-btn-primary', type: 'button' }, '确认')
          confirmButton.addEventListener('click', () => {
            try {
              const sx = Math.max(0, -view.tx / view.s)
              const sy = Math.max(0, -view.ty / view.s)
              const sw = Math.min(naturalW - sx, frameWidth / view.s)
              const sh = Math.min(naturalH - sy, frameHeight / view.s)
              if (sw <= 0 || sh <= 0) throw new Error('裁剪区域无效')
              const outW = Math.min(1080, Math.max(1, Math.round(sw)))
              const outH = Math.round(outW * 4 / 3)
              const canvas = document.createElement('canvas')
              canvas.width = outW
              canvas.height = outH
              const ctx = canvas.getContext('2d')
              ctx.fillStyle = '#FFF7EC'
              ctx.fillRect(0, 0, outW, outH)
              ctx.imageSmoothingQuality = 'high'
              ctx.drawImage(image, sx, sy, sw, sh, 0, 0, outW, outH)
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
              const skin = {
                id: 'skin-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
                name: (file.name || '新皮肤').replace(/\.[a-z0-9]+$/i, '').slice(0, 24) || '新皮肤',
                dataUrl,
                createdAt: Date.now(),
                bytes: Math.round(dataUrl.length * 0.75),
              }
              const nextList = [...loadSkins(), skin]
              try {
                saveSkins(nextList)
                state.skins = nextList
                state.selectedSkin = skin.id
                writeSelectedSkinId(skin.id)
                index += 1
                if (index >= queue.length) {
                  cleanup()
                  renderSelector()
                  focusFirst()
                  showToast('新皮肤已经换上啦', 'success')
                } else {
                  next()
                }
              } catch (error) {
                cleanup()
                openManager(skin)
                showToast('皮肤太多啦，删掉几张旧的吧')
              }
            } catch (error) {
              showToast('这张图片裁剪失败了，换一张试试？')
            }
          })

          const tools = el('div', { class: 'am-crop-tools' }, slider, el('div', { class: 'am-crop-actions' }, changeButton, confirmButton))
          layer.append(header, frame, tools)
        }

        next()
      }

      function openManager(pending) {
        if (state.toast) {
          state.toast.remove()
          state.toast = null
        }
        const layer = el('div', { class: 'am-manager' })
        layerHost.append(layer)
        renderManager(layer, pending)
      }

      function renderManager(layer, pending) {
        const list = loadSkins()
        const all = skinListWithDefault(list)
        if (pending) all.push({ ...pending, pending: true })
        const selected = state.selectedSkin
        const panel = el('div', { class: 'am-manager-panel' },
          el('div', { class: 'am-manager-head' },
            el('div', { class: 'am-manager-title', text: '皮肤管理' }),
            el('button', { class: 'am-icon-btn', type: 'button', 'aria-label': '关闭', onClick: () => { layer.remove(); focusFirst() } }, iconSvg(ICON_CLOSE, 'am-icon')),
          ),
          el('div', { class: 'am-manager-body' },
            el('div', { class: 'am-skin-grid' },
              all.map(skin => {
                const choose = () => {
                  if (skin.pending) return
                  state.selectedSkin = skin.id
                  writeSelectedSkinId(skin.id)
                  renderSelector()
                  renderManager(layer, pending)
                }
                const tile = el('div', {
                  class: 'am-skin-tile' + (skin.id === selected ? ' is-selected' : ''),
                  role: 'button',
                  tabindex: '0',
                  title: skin.name,
                  onClick: choose,
                  onKeyDown: event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      choose()
                    }
                  },
                })
                tile.append(el('img', { src: skin.dataUrl, alt: '' }))
                tile.append(el('span', { class: 'am-skin-size', text: skin.builtin ? '内置' : Math.max(1, Math.round((skin.bytes || 0) / 1024)) + 'KB' }))
                tile.append(el('span', { class: 'am-skin-tile-name', text: skin.pending ? '未保存' : skin.name }))
                if (!skin.builtin) {
                  tile.append(el('button', {
                    class: 'am-skin-tile-del',
                    type: 'button',
                    'aria-label': '删除 ' + skin.name,
                    onClick: event => {
                      event.stopPropagation()
                      if (skin.pending) {
                        layer.remove()
                        focusFirst()
                        return
                      }
                      try {
                        const next = deleteSkin(skin.id)
                        state.skins = next
                        if (state.selectedSkin === skin.id) {
                          state.selectedSkin = DEFAULT_SKIN_ID
                          writeSelectedSkinId(DEFAULT_SKIN_ID)
                        }
                        renderSelector()
                        renderManager(layer, pending)
                      } catch (error) {
                        showToast('删不掉这张皮肤，再试一次？')
                      }
                    },
                  }, iconSvg(ICON_TRASH, 'am-del-icon')))
                }
                return tile
              }),
            ),
            pending ? el('button', {
              class: 'am-btn am-btn-primary am-retry',
              type: 'button',
              onClick: () => {
                try {
                  const next = [...loadSkins(), pending]
                  saveSkins(next)
                  state.skins = next
                  state.selectedSkin = pending.id
                  writeSelectedSkinId(pending.id)
                  layer.remove()
                  renderSelector()
                  focusFirst()
                  showToast('新皮肤已经换上啦', 'success')
                } catch (error) {
                  showToast('还是放不下，再删掉几张旧皮肤吧')
                }
              },
            }, '重试保存') : null,
          ),
        )
        layer.replaceChildren(panel)
      }

      function close() {
        if (state.closed) return
        state.closed = true
        hideBusy()
        if (state.toastTimer) window.clearTimeout(state.toastTimer)
        for (const layer of Array.from(layerHost.children)) {
          if (typeof layer.__amCleanup === 'function') {
            try { layer.__amCleanup() } catch (error) { /* ignore */ }
          }
        }
        root.remove()
        document.body.style.overflow = previousOverflow
        document.removeEventListener('keydown', onKeydown, true)
        window.removeEventListener('resize', updateScale)
        if (activeSession === session) activeSession = null
        if (previousFocus && previousFocus.focus) {
          try { previousFocus.focus({ preventScroll: true }) } catch (error) { /* ignore */ }
        }
      }

      function onKeydown(event) {
        if (event.key === 'Escape') {
          event.stopPropagation()
          event.preventDefault()
          const layer = topLayer()
          if (layer) {
            if (layer.classList.contains('am-medal-layer')) closeMedal('chats')
            else if (layer.classList.contains('am-manager')) {
              layer.remove()
              focusFirst()
            } else if (layer.classList.contains('am-crop')) {
              if (typeof layer.__amCleanup === 'function') layer.__amCleanup()
              else layer.remove()
              renderSelector()
              focusFirst()
            }
            return
          }
          close()
          return
        }
        if (event.key === 'Tab') {
          const scope = topLayer() || selectorHost
          const list = focusableWithin(scope)
          if (!list.length) {
            event.preventDefault()
            return
          }
          const first = list[0]
          const last = list[list.length - 1]
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
          }
        }
      }

      const session = {
        root,
        state,
        close,
        loadList,
        renderSelector,
        openStats,
        openMedal,
        switchMedal,
        selectSkin,
        saveMedal,
        openCrop,
        openManager,
        showToast,
      }

      updateScale()
      document.addEventListener('keydown', onKeydown, true)
      window.addEventListener('resize', updateScale)
      loadList()
      return session
    }

    /* ------------------------------------------------------------------ *
     * 4. Canvas 导出
     * ------------------------------------------------------------------ */

    function roundRectPath(ctx, x, y, w, h, r) {
      const radius = Math.min(r, w / 2, h / 2)
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath()
        ctx.roundRect(x, y, w, h, radius)
        return
      }
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.arcTo(x + w, y, x + w, y + h, radius)
      ctx.arcTo(x + w, y + h, x, y + h, radius)
      ctx.arcTo(x, y + h, x, y, radius)
      ctx.arcTo(x, y, x + w, y, radius)
      ctx.closePath()
    }

    function truncateText(ctx, text, maxWidth) {
      const source = str(text)
      if (ctx.measureText(source).width <= maxWidth) return source
      let low = 0
      let high = source.length
      while (low < high) {
        const mid = Math.ceil((low + high) / 2)
        if (ctx.measureText(source.slice(0, mid) + '…').width <= maxWidth) low = mid
        else high = mid - 1
      }
      return source.slice(0, low) + '…'
    }

    async function exportMedal(medal) {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1440
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('无法创建画布')
      const scale = 1080 / DESIGN_W
      ctx.scale(scale, scale)
      ctx.imageSmoothingQuality = 'high'

      // 圆角卡片
      ctx.save()
      roundRectPath(ctx, 0, 0, DESIGN_W, DESIGN_H, 30)
      ctx.clip()

      const skinUrl = skinUrlOf(readSelectedSkinId(), loadSkins())
      let skinImage = null
      try {
        skinImage = await loadImage(skinUrl)
      } catch (error) {
        skinImage = await loadImage(defaultSkinUrl())
      }
      ctx.drawImage(skinImage, 0, 0, DESIGN_W, DESIGN_H)

      // 渐变遮罩
      const gradient = ctx.createLinearGradient(0, 0, 0, DESIGN_H)
      gradient.addColorStop(0, 'rgba(43,26,18,.45)')
      gradient.addColorStop(0.28, 'rgba(43,26,18,0)')
      gradient.addColorStop(0.52, 'rgba(43,26,18,0)')
      gradient.addColorStop(1, 'rgba(43,26,18,.62)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, DESIGN_W, DESIGN_H)
      const scrim = ctx.createRadialGradient(210, 134, 16, 210, 134, 200)
      scrim.addColorStop(0, 'rgba(43,26,18,.18)')
      scrim.addColorStop(1, 'rgba(43,26,18,0)')
      ctx.fillStyle = scrim
      ctx.fillRect(0, 0, DESIGN_W, DESIGN_H)
      const leftScrim = ctx.createLinearGradient(0, 0, 96, 0)
      leftScrim.addColorStop(0, 'rgba(43,26,18,.24)')
      leftScrim.addColorStop(1, 'rgba(43,26,18,0)')
      ctx.fillStyle = leftScrim
      ctx.fillRect(0, 0, 96, DESIGN_H)
      const bandScrim = ctx.createLinearGradient(0, 218, 0, 488)
      bandScrim.addColorStop(0, 'rgba(43,26,18,0)')
      bandScrim.addColorStop(0.10, 'rgba(43,26,18,.26)')
      bandScrim.addColorStop(0.82, 'rgba(43,26,18,.30)')
      bandScrim.addColorStop(1, 'rgba(43,26,18,0)')
      ctx.fillStyle = bandScrim
      ctx.fillRect(0, 218, DESIGN_W, 270)

      // 勋章阴影
      const shadow = ctx.createRadialGradient(210, 198, 4, 210, 198, 66)
      shadow.addColorStop(0, 'rgba(60,35,20,.30)')
      shadow.addColorStop(1, 'rgba(60,35,20,0)')
      ctx.fillStyle = shadow
      ctx.beginPath()
      ctx.ellipse(210, 198, 66, 17, 0, 0, Math.PI * 2)
      ctx.fill()

      // 勋章
      try {
        const medalImage = await loadImage(svgDataUrl(MEDAL_SVG))
        ctx.drawImage(medalImage, 148, 84, 124, 124)
      } catch (error) {
        // 勋章画不出来时保留阴影，不影响其他内容。
      }

      // 静态星星
      const starPositions = [
        [130, 120, 8, '#F4B942', .8], [282, 104, 6, '#FF9EBB', .75], [300, 190, 7, '#9FE2BF', .7],
        [118, 205, 5, '#FF9EBB', .65], [150, 76, 5, '#9FE2BF', .6], [270, 150, 5, '#F4B942', .7],
      ]
      for (const [x, y, size, color, opacity] of starPositions) {
        ctx.save()
        ctx.globalAlpha = opacity
        ctx.fillStyle = color
        ctx.translate(x, y)
        ctx.beginPath()
        ctx.moveTo(0, -size)
        ctx.lineTo(size * 0.28, -size * 0.28)
        ctx.lineTo(size, 0)
        ctx.lineTo(size * 0.28, size * 0.28)
        ctx.lineTo(0, size)
        ctx.lineTo(-size * 0.28, size * 0.28)
        ctx.lineTo(-size, 0)
        ctx.lineTo(-size * 0.28, -size * 0.28)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }

      // 预模糊皮肤，用于毛玻璃胶囊
      const blurred = makeBlurredSkin(skinImage)

      const stats = medal.stats
      const pills = [
        [ICON_PERSON, '冒险者', str(stats.cardName), true],
        [ICON_DICE, '冒险轮数', formatNumber(stats.turnCount), false],
        [ICON_BOOK, '酒馆记忆', formatNumber(stats.contextChars) + ' 字', false],
        [ICON_CALENDAR, '开始冒险', formatDate(stats.createdAt) || '--', false],
      ]
      for (let i = 0; i < pills.length; i += 1) {
        await drawPill(ctx, 250 + i * 46, pills[i][0], pills[i][1], pills[i][2], blurred, pills[i][3])
      }

      // 成就进度
      drawProgress(ctx, stats.turnCount)

      // 竖排标语
      ctx.fillStyle = 'rgba(255,255,255,.82)'
      ctx.font = '500 11px ' + FONT_STACK
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const sloganChars = Array.from(SLOGAN)
      sloganChars.forEach((char, index) => {
        ctx.fillText(char, 28, 54 + index * 15)
      })

      // 成就
      const tier = tierOf(stats.turnCount)
      if (tier) {
        try {
          const badgeImage = await loadImage(svgDataUrl(badgeSvg(tier.key)))
          ctx.drawImage(badgeImage, 250, 96, 38, 38)
          ctx.fillStyle = '#5E3A28'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.font = (String(tier.n).length >= 4 ? '800 7.5px ' : '800 9px ') + FONT_STACK
          ctx.fillText(String(tier.n), 269, 115)
        } catch (error) {
          // 徽章画不出来时只保留配文。
        }
        ctx.save()
        roundRectPath(ctx, 60, 210, 300, 38, 15)
        ctx.fillStyle = 'rgba(255,247,236,.92)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(244,185,66,.55)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.fillStyle = '#5E3A28'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = '700 11.5px ' + FONT_STACK
        ctx.fillText(tier.label, 210, 220)
        ctx.font = '500 10.5px ' + FONT_STACK
        ctx.fillText('恭喜你达成了' + tier.n + '轮的成就！', 210, 235)
        ctx.restore()
      }

      // 存档圆点 / 皮肤圆点
      drawArchiveSwitcher(ctx, medal.chats.length, medal.index)
      const allSkins = skinListWithDefault(loadSkins())
      if (allSkins.length > 1) {
        const active = Math.max(0, allSkins.findIndex(skin => skin.id === readSelectedSkinId()))
        drawDots(ctx, allSkins.length, active, 210, 511, 'rgba(255,255,255,.45)', '#fff')
      }

      // 页脚
      ctx.fillStyle = 'rgba(255,255,255,.66)'
      ctx.font = '400 10px ' + FONT_STACK
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('DSHTavern 冒险纪念 · ' + medal.date, 210, 548)

      ctx.restore()

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('无法生成图片')
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = '冒险奖牌-' + safeFileName(stats.cardName) + '-' + formatCompactDate(Date.now()).replace(/-/g, '') + '.png'
      link.rel = 'noopener'
      document.body.append(link)
      try {
        link.click()
      } catch (error) {
        window.open(url, '_blank', 'noopener')
      }
      window.setTimeout(() => {
        link.remove()
        URL.revokeObjectURL(url)
      }, 4000)
    }

    function makeBlurredSkin(image) {
      const canvas = document.createElement('canvas')
      canvas.width = DESIGN_W
      canvas.height = DESIGN_H
      const ctx = canvas.getContext('2d')
      if (!ctx) return canvas
      try {
        ctx.filter = 'blur(14px)'
      } catch (error) {
        // 不支持 filter 时直接画原图，胶囊仍有半透明白底。
      }
      try {
        ctx.drawImage(image, 0, 0, DESIGN_W, DESIGN_H)
      } catch (error) {
        // ignore
      }
      try { ctx.filter = 'none' } catch (error) { /* ignore */ }
      return canvas
    }

    async function drawPill(ctx, y, icon, label, value, blurred, isName) {
      ctx.save()
      roundRectPath(ctx, 60, y, 300, 40, 20)
      ctx.clip()
      if (blurred) ctx.drawImage(blurred, 0, 0, DESIGN_W, DESIGN_H)
      ctx.fillStyle = 'rgba(43,26,18,.16)'
      ctx.fillRect(60, y, 300, 40)
      ctx.fillStyle = 'rgba(255,255,255,.22)'
      ctx.fillRect(60, y, 300, 40)
      ctx.restore()

      ctx.save()
      roundRectPath(ctx, 60, y, 300, 40, 20)
      ctx.strokeStyle = 'rgba(255,255,255,.38)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(82, y + 1)
      ctx.lineTo(338, y + 1)
      ctx.strokeStyle = 'rgba(255,255,255,.45)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()

      try {
        const iconImage = await loadImage(iconDataUrl(icon))
        ctx.drawImage(iconImage, 76, y + 12, 16, 16)
      } catch (error) {
        // 图标失败不影响文字。
      }

      ctx.textBaseline = 'middle'
      ctx.textAlign = 'left'
      ctx.fillStyle = 'rgba(255,255,255,.78)'
      ctx.font = '500 11px ' + FONT_STACK
      ctx.fillText(label, 100, y + 20)

      ctx.textAlign = 'right'
      ctx.fillStyle = '#fff'
      ctx.font = '600 13px ' + FONT_STACK
      const text = isName ? truncateText(ctx, value, 168) : str(value)
      ctx.fillText(text, 344, y + 20)
    }

    function drawArchiveSwitcher(ctx, count, active) {
      if (count <= 1) return
      const width = 46 + count * 14
      const x = 210 - width / 2
      const y = 12
      const height = 28
      ctx.save()
      roundRectPath(ctx, x, y, width, height, 14)
      ctx.fillStyle = 'rgba(255,255,255,.18)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,.28)'
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.strokeStyle = 'rgba(255,255,255,.9)'
      ctx.lineWidth = 1.6
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(x + 17, y + 10)
      ctx.lineTo(x + 12, y + 14)
      ctx.lineTo(x + 17, y + 18)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x + width - 17, y + 10)
      ctx.lineTo(x + width - 12, y + 14)
      ctx.lineTo(x + width - 17, y + 18)
      ctx.stroke()

      const start = 210 - (count - 1) * 5
      for (let i = 0; i < count; i += 1) {
        ctx.beginPath()
        ctx.arc(start + i * 10, 26, i === active ? 3.4 : 2.4, 0, Math.PI * 2)
        ctx.fillStyle = i === active ? '#fff' : 'rgba(255,255,255,.45)'
        ctx.fill()
      }
      ctx.restore()
    }

    function drawDots(ctx, count, active, centerX, y, inactiveColor, activeColor) {
      if (count <= 1) return
      const gap = 10
      const start = centerX - (count - 1) * gap / 2
      for (let i = 0; i < count; i += 1) {
        ctx.beginPath()
        ctx.arc(start + i * gap, y, i === active ? 3.4 : 2.4, 0, Math.PI * 2)
        ctx.fillStyle = i === active ? activeColor : inactiveColor
        ctx.fill()
      }
    }

    /* ------------------------------------------------------------------ *
     * 5. 插件入口
     * ------------------------------------------------------------------ */

    function install(ctx) {
      const ui = ctx && ctx.tavernUi
      if (!ui) return
      let currentSessionId = ''
      const launcherStyle = {
        display: 'grid',
        placeItems: 'center',
        width: 28,
        height: 28,
        padding: 0,
        border: 0,
        background: 'transparent',
        color: 'inherit',
        cursor: 'pointer',
        borderRadius: 8,
      }
      const open = () => {
        try {
          openOverlay(ctx, currentSessionId)
        } catch (error) {
          try { console.warn('[adventure-medal] open failed:', error) } catch (ignore) { /* ignore */ }
        }
      }

      if (typeof ctx.effect === 'function') {
        ctx.effect(() => () => {
          if (activeSession) {
            try { activeSession.close() } catch (error) { /* ignore */ }
            activeSession = null
          }
        }, 'adventure-medal: overlay cleanup')
        ctx.effect(() => () => removeStyles(), 'adventure-medal: styles')
      }

      if (React && typeof ui.registerComposerTool === 'function') {
        ui.registerComposerTool({
          id: 'medal',
          modes: ['play'],
          render: ({ sessionId }) => {
            currentSessionId = str(sessionId)
            return React.createElement('button', {
              type: 'button',
              className: 'am-launcher',
              title: '冒险奖牌',
              'aria-label': '冒险奖牌',
              style: launcherStyle,
              onClick: open,
              dangerouslySetInnerHTML: { __html: ICON_MEDAL_LAUNCHER },
            })
          },
        })
        return
      }

      if (React && typeof ui.registerHeaderTool === 'function') {
        ui.registerHeaderTool({
          id: 'medal',
          render: ({ gameId, menu }) => {
            currentSessionId = str(gameId)
            if (menu) {
              return React.createElement('button', {
                type: 'button',
                role: 'menuitem',
                className: 'am-launcher-menu',
                style: { display: 'block', width: '100%', padding: '8px 10px', border: 0, background: 'transparent', color: 'inherit', textAlign: 'left', cursor: 'pointer', font: 'inherit' },
                onClick: open,
              }, '🎖️ 冒险奖牌')
            }
            return React.createElement('button', {
              type: 'button',
              className: 'am-launcher',
              title: '冒险奖牌',
              'aria-label': '冒险奖牌',
              style: launcherStyle,
              onClick: open,
              dangerouslySetInnerHTML: { __html: ICON_MEDAL_LAUNCHER },
            })
          },
        })
        return
      }

      if (typeof ui.registerComposerAction === 'function') {
        ui.registerComposerAction({
          id: 'medal',
          label: '🎖️ 奖牌',
          when: ({ busy }) => !busy,
          run: ({ gameId }) => {
            currentSessionId = str(gameId)
            open()
          },
        })
      }
    }

    return {
      name: NS,
      inject: ['tavernUi'],
      apply(ctx) {
        try {
          install(ctx)
        } catch (error) {
          try { console.warn('[adventure-medal] disabled:', error) } catch (ignore) { /* ignore */ }
        }
      },
    }
  },
})

/* ---------------------------------------------------------------------- *
 * 样式（只作用于 .am-*，不碰酒馆自己的类名）
 * ---------------------------------------------------------------------- */

const CSS_TEXT = `
.am-root, .am-root * { box-sizing: border-box; }
.am-root {
  position: fixed; inset: 0; z-index: 4000;
  display: flex; align-items: center; justify-content: center;
  padding: 16px; overflow: auto;
  background: rgba(30,18,12,.55);
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
  font-family: "PingFang SC","Microsoft YaHei","Noto Sans CJK SC","Source Han Sans SC",sans-serif;
  color: #3E2A20;
  -webkit-tap-highlight-color: transparent;
}
.am-root button { font-family: inherit; }
.am-root button:focus-visible { outline: 2px solid #F4B942; outline-offset: 2px; }
.am-selector-host, .am-layer-host { display: contents; }
.am-panel {
  position: relative;
  width: min(520px, 100%); max-height: min(84dvh, 760px);
  display: flex; flex-direction: column;
  background: #FFF7EC; border-radius: 30px; overflow: hidden;
  box-shadow: 0 30px 60px -20px rgba(60,35,20,.50), 0 12px 24px rgba(60,35,20,.20), 0 2px 6px rgba(60,35,20,.12);
  animation: am-panel-in .45s cubic-bezier(.34,1.56,.64,1) both;
}
.am-panel-loading { min-height: 260px; justify-content: center; }
.am-panel-corner { position: absolute; right: 16px; top: 16px; }
.am-head { display: flex; align-items: center; gap: 12px; padding: 18px 20px 12px; flex: none; }
.am-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.am-brand-mark {
  width: 38px; height: 38px; border-radius: 13px; flex: none;
  display: grid; place-items: center;
  background: linear-gradient(145deg, #FFE7A8, #F4B942);
  box-shadow: 0 6px 14px rgba(244,185,66,.30), inset 0 1px 0 rgba(255,255,255,.55);
}
.am-brand-icon, .am-brand-mark svg { width: 24px; height: 24px; display: block; }
.am-title { font-size: 18px; font-weight: 700; letter-spacing: .5px; }
.am-sub { margin-top: 2px; font-size: 10px; color: #7A5B49; }
.am-head-actions { margin-left: auto; display: flex; gap: 6px; flex: none; }
.am-icon-btn {
  width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(140,91,63,.18);
  background: #FFFDF8; color: #5E3A28; display: grid; place-items: center; cursor: pointer;
  box-shadow: 0 4px 10px rgba(60,35,20,.08); transition: transform .12s ease, background .15s;
}
.am-icon-btn:active { transform: scale(.94); }
.am-icon-btn:hover { background: #FFF1D8; }
.am-icon { width: 18px; height: 18px; display: block; }
.am-body { padding: 0 18px 18px; overflow: auto; min-height: 120px; }
.am-body::-webkit-scrollbar { width: 6px; }
.am-body::-webkit-scrollbar-thumb { background: rgba(140,91,63,.22); border-radius: 99px; }
.am-step { animation: am-step-in .32s cubic-bezier(.34,1.56,.64,1) both; }
.am-note { margin-top: 12px; text-align: center; font-size: 9.5px; color: #9A7B67; }
.am-link { display: block; margin: 8px auto 0; padding: 4px 10px; border: 0; background: transparent; color: #8C5B3F; font-size: 10px; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.am-subhead { display: flex; align-items: baseline; gap: 8px; margin: 2px 0 10px; }
.am-subhead-title { font-size: 14px; font-weight: 700; color: #3E2A20; }
.am-subhead-count { font-size: 10px; color: #9A7B67; }
.am-current {
  position: sticky; top: 0; z-index: 3;
  display: flex; align-items: center; gap: 12px; width: 100%; margin-bottom: 14px;
  padding: 14px 16px; border-radius: 20px; border: 1px solid rgba(244,185,66,.45);
  background: linear-gradient(135deg, #FFE7A8, #F4B942); color: #5E3A28;
  text-align: left; cursor: pointer; box-shadow: 0 12px 26px rgba(244,185,66,.28);
  transition: transform .16s ease, box-shadow .16s ease;
}
.am-current:hover { transform: translateY(-2px); box-shadow: 0 16px 30px rgba(244,185,66,.36); }
.am-current:active { transform: scale(.98); }
.am-current-icon { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,.38); display: grid; place-items: center; flex: none; }
.am-current-icon svg { width: 20px; height: 20px; }
.am-current-main { min-width: 0; flex: 1; }
.am-current-title { display: block; font-size: 14px; font-weight: 700; }
.am-current-sub { display: block; margin-top: 2px; font-size: 10px; color: #7A5B49; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.am-current-arrow { flex: none; font-size: 20px; line-height: 1; opacity: .7; }
.am-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
@media (min-width: 520px) { .am-grid { grid-template-columns: repeat(3, minmax(0,1fr)); } }
.am-tile {
  position: relative; display: block; width: 100%; aspect-ratio: 3 / 4; padding: 0;
  border-radius: 18px; overflow: hidden; border: 0; background: #F7E8D2;
  text-align: left; cursor: pointer; box-shadow: 0 8px 18px rgba(60,35,20,.12);
  transition: transform .18s ease, box-shadow .18s ease;
}
.am-tile:hover { transform: translateY(-3px); box-shadow: 0 14px 26px rgba(60,35,20,.18); }
.am-tile:active { transform: scale(.98); }
.am-tile > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.am-tile-shade { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(43,26,18,0) 40%, rgba(43,26,18,.72) 100%); }
.am-tile-name {
  position: absolute; left: 10px; right: 10px; bottom: 10px; color: #fff;
  font-size: 13px; font-weight: 600; text-shadow: 0 1px 4px rgba(0,0,0,.4);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.am-tile-meta { position: absolute; left: 10px; right: 10px; bottom: 28px; color: rgba(255,255,255,.78); font-size: 10px; }
.am-tile-count {
  position: absolute; top: 8px; right: 8px; min-width: 24px; height: 20px; padding: 0 7px;
  border-radius: 999px; background: rgba(255,247,236,.9); color: #5E3A28;
  font-size: 10px; font-weight: 700; display: grid; place-items: center;
}
.am-tile.is-empty { opacity: .72; }
.am-tile-placeholder {
  position: absolute; inset: 0; display: grid; place-items: center;
  background: linear-gradient(145deg, #F7E8D2, #FFD98A);
  color: #8C5B3F; font-size: 34px; font-weight: 700;
}
.am-list { display: flex; flex-direction: column; gap: 10px; }
.am-row {
  display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px;
  border-radius: 18px; border: 0; background: #FFFDF8; text-align: left; cursor: pointer;
  box-shadow: 0 6px 16px rgba(60,35,20,.08); transition: transform .16s ease, box-shadow .16s ease;
}
.am-row:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(60,35,20,.14); }
.am-row:active { transform: scale(.99); }
.am-row-thumb {
  width: 44px; height: 58px; border-radius: 12px; overflow: hidden; flex: none;
  background: linear-gradient(145deg, #F7E8D2, #FFD98A); display: grid; place-items: center;
  color: #8C5B3F; font-weight: 700;
}
.am-row-thumb img { width: 100%; height: 100%; object-fit: cover; }
.am-row-main { min-width: 0; flex: 1; }
.am-row-title { display: block; font-size: 13px; font-weight: 600; color: #3E2A20; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.am-row-meta { display: block; margin-top: 2px; font-size: 10px; color: #7A5B49; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.am-row-turn { flex: none; text-align: right; }
.am-row-turn b { display: block; font-size: 15px; color: #8C5B3F; font-variant-numeric: tabular-nums; }
.am-row-turn span { font-size: 9px; color: #9A7B67; }
.am-empty { padding: 32px 16px 40px; text-align: center; color: #7A5B49; }
.am-empty-mark { width: 72px; height: 72px; margin: 0 auto 12px; opacity: .8; display: block; }
.am-empty-mark svg { width: 100%; height: 100%; }
.am-empty h3 { margin: 0 0 6px; font-size: 15px; color: #3E2A20; }
.am-empty p { margin: 0; font-size: 11px; line-height: 1.6; }
.am-empty-actions { margin-top: 14px; display: flex; justify-content: center; }
.am-loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 20px 56px; color: #7A5B49; }
.am-spinner { width: 48px; height: 48px; animation: am-pulse 1.2s ease-in-out infinite; }
.am-spinner svg { width: 100%; height: 100%; }
.am-loading p { margin: 0; font-size: 12px; }
.am-busy { position: fixed; inset: 0; z-index: 4500; display: grid; place-items: center; background: rgba(30,18,12,.35); -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px); }
.am-busy-inner { display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-radius: 999px; background: #FFF7EC; color: #5E3A28; box-shadow: 0 16px 40px rgba(60,35,20,.25); font-size: 12px; }
.am-busy-icon { width: 22px; height: 22px; display: block; }
.am-busy-icon svg { width: 100%; height: 100%; }
.am-toast {
  position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 6000;
  pointer-events: none;
  display: flex; align-items: center; gap: 8px; max-width: min(420px, calc(100vw - 32px));
  padding: 12px 16px; border-radius: 16px; background: #FFF7EC; color: #5E3A28;
  font-size: 12px; line-height: 1.5; box-shadow: 0 16px 40px rgba(60,35,20,.25);
  border: 1px solid rgba(244,185,66,.35); animation: am-toast-in .3s ease-out both;
}
.am-toast-icon { flex: none; width: 18px; height: 18px; color: #D99A2B; display: block; }
.am-toast-icon svg { width: 100%; height: 100%; }
.am-medal-layer {
  position: fixed; inset: 0; z-index: 4100; display: flex; align-items: flex-end; justify-content: center;
  background: rgba(30,18,12,.58); -webkit-backdrop-filter: blur(7px); backdrop-filter: blur(7px);
}
.am-sheet {
  width: 100%; max-width: 480px; padding: 0 16px calc(16px + env(safe-area-inset-bottom));
  display: flex; flex-direction: column; align-items: center;
  animation: am-sheet-in .52s cubic-bezier(.34,1.56,.64,1) both;
}
.am-sheet.is-closing { animation: am-sheet-out .28s ease-in forwards; }
.am-sheet-head { width: 100%; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; color: #FFF7EC; }
.am-ghost-btn {
  height: 32px; min-width: 32px; padding: 0 12px; border-radius: 999px;
  border: 1px solid rgba(255,255,255,.28); background: rgba(255,255,255,.12);
  color: #FFF7EC; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;
  cursor: pointer; -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
}
.am-ghost-close { padding: 0; width: 32px; justify-content: center; }
.am-ghost-icon { width: 14px; height: 14px; display: block; }
.am-ghost-icon svg { width: 100%; height: 100%; }
.am-card-wrap { position: relative; width: calc(420px * var(--am-scale, 1)); height: calc(560px * var(--am-scale, 1)); flex: none; }
.am-card {
  position: absolute; left: 0; top: 0; width: 420px; height: 560px;
  transform: scale(var(--am-scale, 1)); transform-origin: top left;
  border-radius: 30px; overflow: hidden; background: #FFF7EC;
  box-shadow: 0 30px 60px -20px rgba(60,35,20,.45), 0 12px 24px rgba(60,35,20,.20), 0 2px 6px rgba(60,35,20,.12);
  isolation: isolate;
}
.am-skin { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity .3s ease; }
.am-skin.is-visible { opacity: 1; }
.am-shade {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(circle at 50% 24%, rgba(43,26,18,.18) 0%, rgba(43,26,18,0) 48%),
    linear-gradient(to bottom, rgba(43,26,18,.45) 0%, rgba(43,26,18,0) 28%, rgba(43,26,18,0) 52%, rgba(43,26,18,.62) 100%);
}
.am-left-scrim {
  position: absolute; left: 0; top: 0; bottom: 0; width: 96px; pointer-events: none;
  background: linear-gradient(to right, rgba(43,26,18,.24) 0%, rgba(43,26,18,0) 100%);
}
.am-content-scrim {
  position: absolute; left: 0; right: 0; top: 218px; height: 270px; pointer-events: none;
  background: linear-gradient(to bottom, rgba(43,26,18,0) 0%, rgba(43,26,18,.26) 10%, rgba(43,26,18,.30) 82%, rgba(43,26,18,0) 100%);
}
.am-slogan {
  position: absolute; left: 22px; top: 46px;
  writing-mode: vertical-rl; text-orientation: upright;
  font-size: 11px; letter-spacing: 2px; line-height: 1.55;
  color: rgba(255,255,255,.82); text-shadow: 0 1px 5px rgba(0,0,0,.35);
  pointer-events: none;
}
.am-medal { position: absolute; left: 50%; top: 84px; width: 124px; height: 124px; transform: translateX(-50%); }
.am-medal-drop { width: 100%; height: 100%; animation: am-medal-drop .72s cubic-bezier(.34,1.56,.64,1) both; }
.am-medal-settle { width: 100%; height: 100%; transform-origin: 50% 10%; animation: am-medal-settle 4.4s ease-in-out .72s 1 both; }
.am-medal-sway { width: 100%; height: 100%; animation: am-medal-sway 2.2s ease-in-out 5.12s infinite; transform-origin: 50% 10%; filter: drop-shadow(0 12px 18px rgba(60,35,20,.28)); }
.am-medal-sway svg { display: block; width: 100%; height: 100%; }
.am-star { position: absolute; pointer-events: none; animation: am-twinkle 2.4s ease-in-out infinite; }
.am-star svg { display: block; width: 100%; height: 100%; }
.am-badge { position: absolute; right: 132px; top: 96px; width: 38px; height: 38px; filter: drop-shadow(0 4px 8px rgba(60,35,20,.25)); animation: am-badge-pop .48s cubic-bezier(.34,1.56,.64,1) both; }
.am-badge-art { position: absolute; inset: 0; display: block; }
.am-badge-art svg { display: block; width: 100%; height: 100%; }
.am-badge-num { position: absolute; left: 0; right: 0; top: 14px; text-align: center; font-size: 9px; line-height: 1; font-weight: 800; letter-spacing: -.2px; color: #5E3A28; }
.am-badge-num.is-long { top: 15px; font-size: 7.5px; }
.am-ribbon {
  position: absolute; left: 50%; top: 210px; transform: translateX(-50%); width: 300px;
  padding: 5px 12px 6px; border-radius: 14px; text-align: center;
  background: rgba(255,247,236,.92); color: #5E3A28;
  border: 1px solid rgba(244,185,66,.55); box-shadow: 0 6px 18px rgba(60,35,20,.18);
}
.am-ribbon b { display: block; font-size: 11.5px; font-weight: 700; letter-spacing: .5px; }
.am-ribbon span { display: block; margin-top: 2px; font-size: 10.5px; line-height: 1.25; white-space: normal; word-break: keep-all; }
.am-pills { position: absolute; left: 60px; top: 250px; width: 300px; display: flex; flex-direction: column; gap: 6px; }
.am-pill {
  display: flex; align-items: center; gap: 10px; height: 40px; padding: 0 16px;
  border-radius: 999px; background: rgba(255,255,255,.22);
  border: 1px solid rgba(255,255,255,.38);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.55), 0 6px 16px rgba(60,35,20,.14);
  -webkit-backdrop-filter: blur(14px) saturate(1.15); backdrop-filter: blur(14px) saturate(1.15);
  color: #fff; min-width: 0;
}
.am-pill-icon { flex: none; width: 16px; height: 16px; opacity: .9; display: block; }
.am-pill-icon svg { width: 100%; height: 100%; display: block; }
.am-pill-label { flex: none; font-size: 11px; letter-spacing: .5px; color: rgba(255,255,255,.78); }
.am-pill-value {
  margin-left: auto; min-width: 0; max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: 13px; font-weight: 600; letter-spacing: .3px; text-align: right;
  text-shadow: 0 1px 4px rgba(0,0,0,.25); font-variant-numeric: tabular-nums;
}
.am-progress { position: absolute; left: 0; right: 0; top: 434px; text-align: center; pointer-events: none; }
.am-progress-label { font-size: 10px; font-weight: 600; letter-spacing: .6px; color: rgba(255,255,255,.86); text-shadow: 0 1px 4px rgba(0,0,0,.5); }
.am-progress-big { display: block; height: 40px; animation: am-progress-pop .3s cubic-bezier(.34,1.56,.64,1) both; }
.am-progress-big svg { display: block; width: 380px; height: 40px; margin: 0 auto; overflow: visible; }
.am-footer { position: absolute; left: 0; right: 0; bottom: 8px; text-align: center; font-size: 10px; letter-spacing: .6px; color: rgba(255,255,255,.66); text-shadow: 0 1px 4px rgba(0,0,0,.35); }
.am-arch {
  position: absolute; left: 50%; top: 12px; transform: translateX(-50%);
  height: 28px; padding: 0 6px; display: flex; align-items: center; gap: 4px;
  border-radius: 999px; background: rgba(255,255,255,.18);
  border: 1px solid rgba(255,255,255,.28); color: #fff;
  -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
}
.am-arch-btn { width: 24px; height: 24px; display: grid; place-items: center; border: 0; background: transparent; color: #fff; cursor: pointer; border-radius: 50%; padding: 0; }
.am-arch-btn:hover { background: rgba(255,255,255,.16); }
.am-arch-icon { width: 12px; height: 12px; display: block; }
.am-arch-icon svg { width: 100%; height: 100%; }
.am-arch-dot { width: 14px; height: 14px; padding: 0; border: 0; background: transparent; display: grid; place-items: center; cursor: pointer; }
.am-arch-dot .am-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.4); display: block; transition: all .2s; }
.am-arch-dot.is-active .am-dot { width: 7px; height: 7px; background: #fff; box-shadow: 0 0 6px rgba(255,255,255,.8); }
.am-skins { position: absolute; left: 50%; bottom: 42px; transform: translateX(-50%); display: flex; gap: 6px; align-items: center; }
.am-skin-dot { width: 14px; height: 14px; padding: 0; border: 0; background: transparent; display: grid; place-items: center; cursor: pointer; }
.am-skin-dot span { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,.45); display: block; transition: all .2s; }
.am-skin-dot.is-active span { width: 8px; height: 8px; background: #fff; box-shadow: 0 0 6px rgba(255,255,255,.8); }
.am-actions { display: flex; gap: 10px; width: calc(420px * var(--am-scale, 1)); max-width: 100%; margin-top: 12px; }
.am-btn {
  min-height: 46px; border-radius: 999px; border: 1px solid transparent;
  font: inherit; font-size: 14px; font-weight: 600;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; transition: transform .12s ease, box-shadow .2s ease;
}
.am-btn:active { transform: scale(.95); }
.am-btn:disabled { opacity: .65; cursor: default; transform: none; }
.am-btn.is-busy { opacity: .72; }
.am-btn-primary {
  flex: 1.35; background: linear-gradient(135deg, #FFD98A, #F4B942); color: #5E3A28;
  box-shadow: 0 10px 24px rgba(244,185,66,.35), inset 0 1px 0 rgba(255,255,255,.6);
}
.am-btn-secondary {
  flex: 1; background: rgba(255,247,236,.92); color: #5E3A28;
  border-color: rgba(255,255,255,.5); box-shadow: 0 8px 20px rgba(60,35,20,.2);
}
.am-btn-icon { width: 18px; height: 18px; display: block; }
.am-btn-icon svg { width: 100%; height: 100%; }
.am-confetti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.am-confetti-piece {
  position: absolute; border-radius: 2px; opacity: 1;
  animation: am-fall 1.5s ease-out forwards;
}
.am-crop {
  position: fixed; inset: 0; z-index: 5000; background: rgba(18,10,6,.86);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 16px;
}
.am-crop-head { position: absolute; left: 0; right: 0; top: 0; display: flex; align-items: center; justify-content: space-between; padding: 16px; color: #FFF7EC; }
.am-crop-title { font-size: 15px; font-weight: 600; }
.am-crop-count { font-size: 11px; color: rgba(255,255,255,.65); }
.am-crop-frame {
  position: relative; overflow: hidden; border-radius: 24px; background: #000;
  box-shadow: 0 0 0 9999px rgba(0,0,0,.55), 0 20px 50px rgba(0,0,0,.4);
  touch-action: none; cursor: grab;
}
.am-crop-frame:active { cursor: grabbing; }
.am-crop-img { position: absolute; left: 0; top: 0; max-width: none; max-height: none; transform-origin: 0 0; user-select: none; -webkit-user-drag: none; pointer-events: none; }
.am-crop-tools { display: flex; flex-direction: column; align-items: center; gap: 12px; width: min(340px, 80vw); }
.am-crop-slider { width: 100%; accent-color: #F4B942; height: 24px; }
.am-crop-actions { display: flex; gap: 10px; width: 100%; }
.am-crop-actions .am-btn { flex: 1; }
@media (max-width: 520px) {
  .am-crop { justify-content: flex-end; padding-bottom: max(16px, env(safe-area-inset-bottom)); }
}
.am-manager { position: fixed; inset: 0; z-index: 5000; background: rgba(30,18,12,.55); -webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px); display: grid; place-items: center; padding: 16px; }
.am-manager-panel { width: min(520px, 100%); max-height: min(82dvh, 700px); background: #FFF7EC; border-radius: 28px; box-shadow: 0 30px 60px -20px rgba(60,35,20,.5); display: flex; flex-direction: column; overflow: hidden; animation: am-panel-in .4s cubic-bezier(.34,1.56,.64,1) both; }
.am-manager-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px 10px; flex: none; }
.am-manager-title { font-size: 16px; font-weight: 700; }
.am-manager-body { padding: 0 18px 18px; overflow: auto; }
.am-skin-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 10px; }
.am-skin-tile { position: relative; aspect-ratio: 3 / 4; border-radius: 14px; overflow: hidden; border: 2px solid transparent; background: #F7E8D2; cursor: pointer; padding: 0; }
.am-skin-tile.is-selected { border-color: #F4B942; box-shadow: 0 0 0 3px rgba(244,185,66,.25); }
.am-skin-tile img { width: 100%; height: 100%; object-fit: cover; display: block; }
.am-skin-tile-name { position: absolute; left: 0; right: 0; bottom: 0; padding: 12px 6px 5px; background: linear-gradient(transparent, rgba(43,26,18,.7)); color: #fff; font-size: 9px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.am-skin-size { position: absolute; top: 6px; left: 6px; padding: 2px 6px; border-radius: 999px; background: rgba(43,26,18,.55); color: #fff; font-size: 8px; }
.am-skin-tile-del { position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; border-radius: 50%; border: 0; background: rgba(255,247,236,.92); color: #8C5B3F; display: grid; place-items: center; cursor: pointer; padding: 0; }
.am-del-icon { width: 12px; height: 12px; display: block; }
.am-del-icon svg { width: 100%; height: 100%; }
.am-retry { width: 100%; margin-top: 12px; flex: none; }
.am-launcher {
  display: grid; place-items: center; width: 28px; height: 28px; padding: 0;
  border: 0; background: transparent; color: inherit; cursor: pointer; border-radius: 8px;
}
.am-launcher:hover { background: rgba(244,185,66,.16); }
.am-launcher svg { width: 20px; height: 20px; display: block; }
.am-launcher-menu { display: block; width: 100%; padding: 8px 10px; border: 0; background: transparent; color: inherit; text-align: left; cursor: pointer; font: inherit; }
.am-launcher-menu:hover { background: rgba(244,185,66,.16); }
@keyframes am-panel-in { from { opacity: 0; transform: translateY(16px) scale(.96); } to { opacity: 1; transform: none; } }
@keyframes am-sheet-in { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes am-sheet-out { to { transform: translateY(110%); opacity: .6; } }
@keyframes am-medal-drop { 0% { opacity: 0; transform: translateY(-70px) rotate(-5deg) scale(.86); } 55% { opacity: 1; transform: translateY(6px) rotate(2deg) scale(1.02); } 78% { transform: translateY(-2px) rotate(-1deg); } 100% { opacity: 1; transform: translateY(0) rotate(0) scale(1); } }
@keyframes am-medal-settle { 0% { transform: rotate(0); } 12% { transform: rotate(7deg); } 25% { transform: rotate(0); } 37% { transform: rotate(-6.4deg); } 50% { transform: rotate(0); } 62% { transform: rotate(5.6deg); } 75% { transform: rotate(0); } 87% { transform: rotate(-4.8deg); } 100% { transform: rotate(0); } }
@keyframes am-medal-sway { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(4deg); } 75% { transform: rotate(-4deg); } }
@keyframes am-progress-pop { 0% { transform: scale(.8); opacity: .5; } 60% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
@keyframes am-twinkle { 0%, 100% { opacity: .25; transform: scale(.8); } 50% { opacity: 1; transform: scale(1.15); } }
@keyframes am-badge-pop { 0% { opacity: 0; transform: scale(0) rotate(-30deg); } 60% { opacity: 1; transform: scale(1.15) rotate(6deg); } 100% { opacity: 1; transform: scale(1) rotate(0); } }
@keyframes am-fall {
  0% { opacity: 1; transform: translate(0, 0) rotate(0deg); }
  100% { opacity: 0; transform: translate(var(--am-dx, 0px), 260px) rotate(var(--am-rot, 0deg)); }
}
@keyframes am-step-in { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: none; } }
@keyframes am-pulse { 0%, 100% { transform: scale(.92); opacity: .7; } 50% { transform: scale(1.06); opacity: 1; } }
@keyframes am-toast-in { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
@keyframes am-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .am-panel, .am-sheet, .am-medal-drop, .am-medal-settle, .am-medal-sway, .am-star, .am-badge, .am-progress-big, .am-confetti-piece, .am-step, .am-spinner, .am-toast, .am-skin {
    animation: none !important; transition: none !important;
  }
}
`
