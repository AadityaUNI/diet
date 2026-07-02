import MacroCircle from "./macroCircle";

interface macroProp {
    fill: number;
    target: number;
}

interface targetBarProps {
    protein: macroProp;
    carbs: macroProp;
    fats: macroProp;
    fibre: macroProp;
    energy: macroProp;
}

// Updated to vibrant, modern colors that pop on dark backgrounds
const colorMap = {
    protein: "bg-rose-500", 
    carbs: "bg-sky-500",
    fats: "bg-emerald-500",
    fibre: "bg-violet-500",
    energy: "bg-amber-500"
};

type Macro = keyof targetBarProps;

export default function MacroTargetBar(props: targetBarProps) {
    return (
        <div className="lg:w-auto max-w-dvw flex flex-col items-center justify-center h-auto m-2 p-6 rounded-2xl bg-slate-900 shadow-xl">
            {/* Moved the title to the top for better visual hierarchy */}
            <h2 className="text-xl font-semibold text-slate-200 mb-6 tracking-wide">
                Remaining for Today
            </h2>

            <div className="w-full flex justify-between gap-2">
                {Object.entries(colorMap).map(([macro, colorClass]) => {
                    const remaining = props[macro as Macro].target - props[macro as Macro].fill;
                    const unit = macro === "energy" ? "kcal" : "g";
                    
                    return (
                        <div key={macro} className="flex flex-col items-center gap-3">
                            {/* Macro Label */}
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                {macro}
                            </span>
                            
                            <MacroCircle 
                                filled={props[macro as Macro].fill} 
                                capacity={props[macro as Macro].target} 
                                colorClass={colorClass} 
                            /> 
                            
                            {/* Remaining Value + Explicit 'Left' label */}
                            <div className="flex flex-col items-center mt-1">
                                <span className="text-lg font-bold text-slate-100 leading-none">
                                    {remaining}{unit}
                                </span>
                                <span className="text-xs text-slate-500 font-medium uppercase mt-1">
                                    Left
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}