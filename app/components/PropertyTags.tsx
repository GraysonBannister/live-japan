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

  // Tag color mapping
  const getTagColor = (tag: string): string => {
    const colors: Record<string, string> = {
      '女性向け': 'bg-pink-100 text-pink-800',
      'WiFi無料': 'bg-blue-100 text-blue-800',
      'wifiあり': 'bg-blue-100 text-blue-800',
      'オートロック': 'bg-green-100 text-green-800',
      '保証人不要': 'bg-purple-100 text-purple-800',
      '家具付賃貸': 'bg-orange-100 text-orange-800',
      '禁煙ルーム': 'bg-gray-100 text-gray-800',
      'カード決済OK': 'bg-indigo-100 text-indigo-800',
      '法人契約歓迎': 'bg-teal-100 text-teal-800',
      '出張・研修向け': 'bg-cyan-100 text-cyan-800',
      'テレワーク・在宅勤務可': 'bg-sky-100 text-sky-800',
      'ペット可': 'bg-amber-100 text-amber-800',
      '食事付': 'bg-rose-100 text-rose-800',
      'インターネット無料': 'bg-blue-100 text-blue-800',
      '風呂・トイレ別': 'bg-emerald-100 text-emerald-800',
    };
    
    return colors[tag] || 'bg-gray-100 text-gray-700';
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
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          +{tags.length - (limit || 0)} more
        </span>
      )}
    </div>
  );
}