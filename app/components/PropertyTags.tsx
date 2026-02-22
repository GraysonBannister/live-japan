interface PropertyTagsProps {
  tags: string[];
  limit?: number;
}

export default function PropertyTags({ tags, limit = 6 }: PropertyTagsProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const displayTags = limit ? tags.slice(0, limit) : tags;
  const hasMore = tags.length > (limit || 0);

  // Tag color mapping - Japanese-inspired palette
  const getTagColor = (tag: string): string => {
    const colors: Record<string, string> = {
      // Women-only - Sakura pink
      '女性向け': 'bg-[#FFB7C5]/30 text-[#8B4513]',
      
      // WiFi/Internet - Indigo (traditional ai-iro)
      'WiFi無料': 'bg-[#3F51B5]/10 text-[#283593]',
      'wifiあり': 'bg-[#3F51B5]/10 text-[#283593]',
      'インターネット無料': 'bg-[#3F51B5]/10 text-[#283593]',
      
      // Security - Indigo
      'オートロック': 'bg-[#3F51B5]/10 text-[#283593]',
      
      // No guarantor - Bamboo green (positive)
      '保証人不要': 'bg-[#6B8E23]/15 text-[#4A6318]',
      
      // Furnished - Warm amber/gold
      '家具付賃貸': 'bg-[#D4A574]/20 text-[#8B6914]',
      '家具付': 'bg-[#D4A574]/20 text-[#8B6914]',
      
      // Non-smoking - Stone gray
      '禁煙ルーム': 'bg-[#78716C]/15 text-[#57534E]',
      
      // Card payment - Indigo
      'カード決済OK': 'bg-[#3F51B5]/10 text-[#283593]',
      
      // Corporate - Indigo
      '法人契約歓迎': 'bg-[#3F51B5]/10 text-[#283593]',
      
      // Business travel - Indigo
      '出張・研修向け': 'bg-[#3F51B5]/10 text-[#283593]',
      
      // Telework - Indigo
      'テレワーク・在宅勤務可': 'bg-[#3F51B5]/10 text-[#283593]',
      
      // Pet - Warm earth tone
      'ペット可': 'bg-[#8B6914]/15 text-[#5C4A0B]',
      
      // Food included - Vermilion accent
      '食事付': 'bg-[#D84315]/10 text-[#BF360C]',
      
      // Separate bath/toilet - Bamboo green
      '風呂・トイレ別': 'bg-[#6B8E23]/15 text-[#4A6318]',
      '風呂･トイレ別': 'bg-[#6B8E23]/15 text-[#4A6318]',
      
      // Near station - Indigo (transportation)
      '駅近': 'bg-[#3F51B5]/10 text-[#283593]',
      '駅徒歩5分以内': 'bg-[#3F51B5]/10 text-[#283593]',
      
      // Designer - Warm amber (style/premium)
      'デザイナーズ': 'bg-[#D4A574]/20 text-[#8B6914]',
      
      // Upper floor/great view - Vermilion (premium)
      '上階･眺望抜群': 'bg-[#D84315]/10 text-[#BF360C]',
      '上階・眺望抜群': 'bg-[#D84315]/10 text-[#BF360C]',
      '眺望良好': 'bg-[#D84315]/10 text-[#BF360C]',
      
      // Student-oriented - Bamboo green
      '学生向け': 'bg-[#6B8E23]/15 text-[#4A6318]',
      
      // Good sunlight - Warm gold
      '日当り良好': 'bg-[#D4A574]/20 text-[#8B6914]',
      '日当たり良好': 'bg-[#D4A574]/20 text-[#8B6914]',
      
      // Quiet residential - Stone gray
      '閑静な住宅地': 'bg-[#78716C]/15 text-[#57534E]',
      
      // Rent negotiable - Bamboo green (positive)
      '賃料交渉可': 'bg-[#6B8E23]/15 text-[#4A6318]',
      
      // Air purifier - Indigo (amenity)
      '空気清浄機付': 'bg-[#3F51B5]/10 text-[#283593]',
      
      // Near hospital - Indigo (location/service)
      '病院近く': 'bg-[#3F51B5]/10 text-[#283593]',
      
      // Express response - Vermilion (urgent/service)
      '特急対応可': 'bg-[#D84315]/10 text-[#BF360C]',
      
      // Additional common tags
      '即入居可': 'bg-[#6B8E23]/15 text-[#4A6318]',
      '礼金なし': 'bg-[#6B8E23]/15 text-[#4A6318]',
      '敷金なし': 'bg-[#6B8E23]/15 text-[#4A6318]',
      '新築': 'bg-[#D84315]/10 text-[#BF360C]',
      'リノベーション': 'bg-[#D4A574]/20 text-[#8B6914]',
      '宅配ボックス': 'bg-[#3F51B5]/10 text-[#283593]',
      'エレベーター': 'bg-[#3F51B5]/10 text-[#283593]',
      'バス・トイレ別': 'bg-[#6B8E23]/15 text-[#4A6318]',
      '独立洗面台': 'bg-[#6B8E23]/15 text-[#4A6318]',
      '浴室乾燥機': 'bg-[#3F51B5]/10 text-[#283593]',
      '温水洗浄便座': 'bg-[#3F51B5]/10 text-[#283593]',
      '追い焚き': 'bg-[#3F51B5]/10 text-[#283593]',
      'システムキッチン': 'bg-[#3F51B5]/10 text-[#283593]',
      '角部屋': 'bg-[#D4A574]/20 text-[#8B6914]',
      '南向き': 'bg-[#D4A574]/20 text-[#8B6914]',
      'バルコニー': 'bg-[#3F51B5]/10 text-[#283593]',
      'ロフト付き': 'bg-[#D4A574]/20 text-[#8B6914]',
      'メゾネット': 'bg-[#D4A574]/20 text-[#8B6914]',
    };
    
    return colors[tag] || 'bg-[#E7E5E4] text-[#57534E]';
  };

  return (
    <div className="flex flex-wrap gap-2">
      {displayTags.map((tag, index) => (
        <span
          key={index}
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
        >
          {tag}
        </span>
      ))}
      {hasMore && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#E7E5E4] text-[#78716C]">
          +{tags.length - (limit || 0)} more
        </span>
      )}
    </div>
  );
}
