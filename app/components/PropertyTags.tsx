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
