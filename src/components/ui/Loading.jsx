import { Card } from "@/components/atoms/Card";

const Loading = ({ type = "cards" }) => {
  if (type === "table") {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-100 p-4">
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-slate-200 p-4">
              <div className="grid grid-cols-5 gap-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "stats") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-slate-200 rounded w-20"></div>
              <div className="w-8 h-8 bg-slate-200 rounded"></div>
            </div>
            <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-24"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded"></div>
            <div className="h-3 bg-slate-200 rounded w-5/6"></div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Loading;