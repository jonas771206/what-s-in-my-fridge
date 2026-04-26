// Maps TheMealDB `strArea` values (cuisine labels, not strict country names)
// to a single representative flag emoji. Source list:
// https://www.themealdb.com/api/json/v1/1/list.php?a=list

export const FLAGS = {
  Algerian: '🇩🇿',
  American: '🇺🇸',
  Argentinian: '🇦🇷',
  Australian: '🇦🇺',
  British: '🇬🇧',
  Canadian: '🇨🇦',
  Chinese: '🇨🇳',
  Croatian: '🇭🇷',
  Dutch: '🇳🇱',
  Egyptian: '🇪🇬',
  Filipino: '🇵🇭',
  French: '🇫🇷',
  Greek: '🇬🇷',
  Indian: '🇮🇳',
  Irish: '🇮🇪',
  Italian: '🇮🇹',
  Jamaican: '🇯🇲',
  Japanese: '🇯🇵',
  Kenyan: '🇰🇪',
  Malaysian: '🇲🇾',
  Mexican: '🇲🇽',
  Moroccan: '🇲🇦',
  Norwegian: '🇳🇴',
  Polish: '🇵🇱',
  Portuguese: '🇵🇹',
  Russian: '🇷🇺',
  'Saudi Arabian': '🇸🇦',
  Slovakian: '🇸🇰',
  Spanish: '🇪🇸',
  Syrian: '🇸🇾',
  Thai: '🇹🇭',
  Tunisian: '🇹🇳',
  Turkish: '🇹🇷',
  Ukrainian: '🇺🇦',
  Uruguayan: '🇺🇾',
  Venezulan: '🇻🇪',  // TheMealDB returns this spelling (sic)
  Venezuelan: '🇻🇪', // defensive — in case TheMealDB fixes the typo
  Vietnamese: '🇻🇳',
}
