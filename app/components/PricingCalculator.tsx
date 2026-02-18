'use client';

import { useState } from 'react';

interface PricingPlan {
  name: string;
  duration: string;
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

  const extractMinDays = (duration: string): number => {
    // Match patterns like "30日以上", "7日以上", "1ヶ月"
    const dayMatch = duration.match(/(\d+)日以上/);
    if (dayMatch) return parseInt(dayMatch[1]);
    
    const monthMatch = duration.match(/(\d+)ヶ月/);
    if (monthMatch) return parseInt(monthMatch[1]) * 30;
    
    return 0;
  };

  const extractMaxDays = (duration: string): number => {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing & Plans / 料金プラン</h2>
      
      {/* Calculator */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Stay Duration / 滞在期間
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="7"
            max="365"
            value={stayDuration}
            onChange={(e) => setStayDuration(parseInt(e.target.value))}
            className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-lg font-semibold text-blue-900 min-w-[100px]">
            {stayDuration} days
          </span>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          {Math.floor(stayDuration / 30)} months {stayDuration % 30} days
        </div>
      </div>

      {/* Cost Summary */}
      <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
        <div className="text-sm text-green-800 mb-1">Estimated Total Cost / 見積もり合計</div>
        <div className="text-3xl font-bold text-green-900">
          ¥{totalCost.toLocaleString()}
        </div>
        <div className="text-sm text-green-700 mt-1">
          {applicablePlan.name} · {totalMonths} months + Initial cost
        </div>
      </div>

      {/* All Pricing Plans */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Plans / 利用可能プラン</h3>
      <div className="space-y-3">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              applicablePlan.name === plan.name
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setStayDuration(extractMinDays(plan.duration) || 30)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{plan.duration || 'Flexible duration'}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-900">
                  ¥{plan.monthlyPrice.toLocaleString()}
                  <span className="text-sm font-normal text-gray-600">/月</span>
                </div>
                {plan.initialCost > 0 && (
                  <div className="text-sm text-gray-500">
                    Initial: ¥{plan.initialCost.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            {applicablePlan.name === plan.name && (
              <div className="mt-2 text-sm text-blue-700 font-medium">
                ✓ Best for your selected duration
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="mt-6 text-sm text-gray-500 space-y-1">
        <p>※ Prices are estimates. Contact the property for exact pricing.</p>
        <p>※ Additional fees may apply (utilities, cleaning, etc.)</p>
        <p>※ 料金は目安です。正確な料金は物件にお問い合わせください。</p>
      </div>
    </div>
  );
}