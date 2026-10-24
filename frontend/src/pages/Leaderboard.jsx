import React from "react";

const leaderboardData = [
  {
    id: 1,
    name: "You",
    points: 420,
    study: "5h 40m",
    streak: 6,
  },
  {
    id: 2,
    name: "Ananya",
    points: 395,
    study: "5h 10m",
    streak: 5,
  },
  {
    id: 3,
    name: "Rahul",
    points: 360,
    study: "4h 30m",
    streak: 4,
  },
  {
    id: 4,
    name: "Meera",
    points: 330,
    study: "4h",
    streak: 3,
  },
];

function Leaderboard() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🏆 Weekly Leaderboard</h1>
        <p className="text-sm text-gray-500">
          Friends-only · Resets every week · Stay consistent 🌱
        </p>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-sm text-gray-600">
            <tr>
              <th className="py-3 px-4 text-left">Rank</th>
              <th className="py-3 px-4 text-left">Student</th>
              <th className="py-3 px-4 text-center">Study Time</th>
              <th className="py-3 px-4 text-center">Streak 🔥</th>
              <th className="py-3 px-4 text-right">Points</th>
            </tr>
          </thead>

          <tbody>
            {leaderboardData.map((user, index) => (
              <tr
                key={user.id}
                className={`border-b last:border-none ${
                  user.name === "You"
                    ? "bg-blue-50 font-semibold"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="py-3 px-4">#{index + 1}</td>
                <td className="py-3 px-4">
                  {user.name}
                  {index === 0 && " 🥇"}
                  {index === 1 && " 🥈"}
                  {index === 2 && " 🥉"}
                </td>
                <td className="py-3 px-4 text-center">{user.study}</td>
                <td className="py-3 px-4 text-center">
                  {user.streak} days
                </td>
                <td className="py-3 px-4 text-right text-blue-600">
                  {user.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Motivation Message */}
      <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded-lg">
        <p className="text-sm text-green-700">
          🌟 You’re just <strong>25 points</strong> away from the top!  
          Complete one 50-min session or a medium task to catch up 🚀
        </p>
      </div>
    </div>
  );
}

export default Leaderboard;
