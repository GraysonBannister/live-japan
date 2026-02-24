'use client';

import { useState, useContext } from 'react';
import { CurrencyContext } from './CurrencyProvider';
import { formatCurrencyValue } from '../lib/currency';

interface PricingPlan {
  name: string;
  duration?: string;
  monthlyPrice: number;
  initialCost: number;
  features: string[];
}

interface PricingCalculatorProps {
  plans: PricingPlan[];
}

export default function PricingCalculator({ plans }: PricingCalculatorProps) {
  const [stayDuration, setStayDuration] = useState<number>(30); // days
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(plans[0] || null);
  
  // Use context directly to avoid errors during SSR
  const currencyContext = useContext(CurrencyContext);
  
  // Fallback formatter for SSR/static generation
  const formatConvertedPrice = (amount: number) => {
    if (!currencyContext) {
      return `¥${amount.toLocaleString('ja-JP')}`;
    }
    return currencyContext.formatConvertedPrice(amount);
  };

  if (!plans || plans.length === 0) {
    return null;
  }

  // Calculate which plan applies based on duration
  const getApplicablePlan = (days: number): PricingPlan => {
    // Sort plans by minimum duration
    const sortedPlans = [...plans].sort((a, b) => {
      const aMin = extractMinDays(a.duration);
      const bMin = extractMinDays(b.duration);
      return bMin - aMin; // Descending - check longest first
    });

    // Find the plan that matches the duration
    for (const plan of sortedPlans) {
      const minDays = extractMinDays(plan.duration);
      const maxDays = extractMaxDays(plan.duration);
      
      if (days >= minDays && (maxDays === 0 || days < maxDays)) {
        return plan;
      }
    }
    
    return plans[0];
  };

  const extractMinDays = (duration: string | undefined): number => {
    if (!duration) return 0;
    // Match patterns like "30日以上", "7日以上", "1ヶ月"
    const dayMatch = duration.match(/(\d+)日以上/);
    if (dayMatch) return parseInt(dayMatch[1]);

    const monthMatch = duration.match(/(\d+)ヶ月/);
    if (monthMatch) return parseInt(monthMatch[1]) * 30;

    return 0;
  };

  const extractMaxDays = (duration: string | undefined): number => {
    if (!duration) return 0;
    // Match patterns like "～90日未満", "～365日未満"
    const dayMatch = duration.match(/～(\d+)日未満/);
    if (dayMatch) return parseInt(dayMatch[1]);

    const monthMatch = duration.match(/～(\d+)ヶ月未満/);
    if (monthMatch) return parseInt(monthMatch[1]) * 30;

    return 0;
  };

  const applicablePlan = getApplicablePlan(stayDuration);
  const monthlyCost = applicablePlan.monthlyPrice;
  const initialCost = applicablePlan.initialCost || 27500; // Default initial cost
  const totalMonths = Math.ceil(stayDuration / 30);
  const totalCost = (monthlyCost * totalMonths) + initialCost;

  return (
    <div className="bg-[#FDFBF7] rounded-xl shadow-sm border border-[#E7E5E4] p-6">
      <h2 className="text-xl font-bold text-[#2C2416] mb-4">Pricing & Plans / 料金プラン</h2>
      
      {/* Calculator */}
      <div className="bg-[#3F51B5]/5 rounded-lg p-4 mb-6">
        <label className="block text-sm font-medium text-[#2C2416] mb-2">
          Stay Duration / 滞在期間
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="7"
            max="365"
            value={stayDuration}
            onChange={(e) => setStayDuration(parseInt(e.target.value))}
            className="flex-1 h-2 bg-[#3F51B5]/20 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-lg font-semibold text-[#283593] min-w-[100px]">
            {stayDuration} days
          </span>
        </div>
        <div className="mt-3 text-sm text-[#78716C]">
          {Math.floor(stayDuration / 30)} months {stayDuration % 30} days
        </div>
      </div>

      {/* Cost Summary */}
      <div className="bg-[#6B8E23]/10 rounded-lg p-4 mb-6 border border-[#6B8E23]/20">
        <div className="text-sm text-[#4A6318] mb-1">Estimated Total Cost / 見積もり合計</div>
        <div className="text-3xl font-bold text-[#4A6318]">
          {formatConvertedPrice(totalCost)}
        </div>
        <div className="text-sm text-[#6B8E23] mt-1">
          {applicablePlan.name} · {totalMonths} months + Initial cost
        </div>
      </div>

      {/* All Pricing Plans */}
      <h3 className="text-lg font-semibold text-[#2C2416] mb-3">Available Plans / 利用可能プラン</h3>
      <div className="space-y-3">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              applicablePlan.name === plan.name
                ? 'border-[#3F51B5] bg-[#3F51B5]/5 ring-2 ring-[#3F51B5]/20'
                : 'border-[#E7E5E4] hover:border-[#3F51B5]/50'
            }`}
            onClick={() => setStayDuration(extractMinDays(plan.duration) || 30)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-[#2C2416]">{plan.name}</h4>
                <p className="text-sm text-[#78716C] mt-1">{plan.duration || 'Flexible duration'}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-[#D84315]">
                  {formatConvertedPrice(plan.monthlyPrice)}
                  <span className="text-sm font-normal text-[#78716C]">/月</span>
                </div>
                {plan.initialCost > 0 && (
                  <div className="text-sm text-[#78716C]">
                    Initial: {formatConvertedPrice(plan.initialCost)}
                  </div>
                )}
              </div>
            </div>
            {applicablePlan.name === plan.name && (
              <div className="mt-2 text-sm text-[#3F51B5] font-medium">
                ✓ Best for your selected duration
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="mt-6 text-sm text-[#78716C] space-y-1">
        <p>※ Prices are estimates. Contact the property for exact pricing.</p>
        <p>※ Additional fees may apply (utilities, cleaning, etc.)</p>
        <p>※ 料金は目安です。正確な料金は物件にお問い合わせください。</p>
      </div>
    </div>
  );
}
