import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { PiggyBank } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const SavingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { savingsGoals } = useApp();

  const goal = savingsGoals.find(g => g.id === id);

  if (!goal) return <p className="p-6 text-center">Saving not found</p>;

  const totalContribution = goal.members?.reduce((sum, m) => sum + (m.contribution || 0), 0) || 0;

  const pieData = {
    labels: goal.members?.map(m => m.name) || ['No Members'],
    datasets: [
      {
        data: goal.members?.map(m => m.contribution || 0) || [1],
        backgroundColor: goal.members?.map((_, idx) => `hsl(${idx * 60}, 70%, 60%)`) || ['#4ade80'],
      },
    ],
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <PiggyBank className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">{goal.title}</h1>
        </div>

        <p className="mb-1">Target Amount: ${goal.targetAmount.toFixed(2)}</p>
        <p className="mb-4">Current Amount: ${goal.currentAmount.toFixed(2)}</p>
        {goal.deadline && <p className="mb-4">Deadline: {goal.deadline}</p>}

        {goal.members && goal.members.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold mb-2">Members Contributions</h2>
            <div className="space-y-3">
              {goal.members.map((m, idx) => {
                const percent = ((m.contribution || 0) / goal.targetAmount) * 100;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{m.name}</span>
                      <span>${m.contribution?.toFixed(2) || 0}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pie Chart */}
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Contribution Distribution</h2>
          <Pie data={pieData} />
        </div>

        <Button onClick={() => navigate(-1)}>Back</Button>
      </Card>
    </div>
  );
};

export default SavingDetails;
