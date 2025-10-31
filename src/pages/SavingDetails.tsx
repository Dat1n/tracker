import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  Cat,
  Video,
  Heart,
  ArrowLeft,
  ImagePlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

const SavingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { savingsGoals } = useApp();

  const goal = savingsGoals.find((g) => g.id === id);
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");
  const [videos, setVideos] = useState<string[]>([]);
  const [newVideo, setNewVideo] = useState("");
  const [pictures, setPictures] = useState<string[]>([]);
  const [currentVideo, setCurrentVideo] = useState(0);

  // Auto slideshow for videos every 6s
  useEffect(() => {
    if (videos.length > 1) {
      const interval = setInterval(() => {
        setCurrentVideo((prev) => (prev + 1) % videos.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [videos]);

  if (!goal) return <p className="p-6 text-center">Saving not found</p>;

  const totalContribution =
    goal.members?.reduce((sum, m) => sum + (m.contribution || 0), 0) || 0;
  const progress = (totalContribution / goal.targetAmount) * 100;

  const pieData = {
    labels: goal.members?.map((m) => m.name) || ["No Members"],
    datasets: [
      {
        data: goal.members?.map((m) => m.contribution || 0) || [1],
        backgroundColor: goal.members?.map(
          (_, idx) => `hsl(${idx * 70}, 75%, 60%)`
        ) || ["#f472b6"],
      },
    ],
  };

  const addNote = () => {
    if (newNote.trim()) {
      const timestamp = new Date().toLocaleString();
      setNotes((prev) => [`💖 ${timestamp}\n${newNote}`, ...prev]);
      setNewNote("");
    }
  };

  const addVideo = () => {
    if (newVideo.trim()) {
      setVideos((prev) => [newVideo, ...prev]);
      setNewVideo("");
    }
  };

  const addPicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setPictures((prev) => [...urls, ...prev]);
  };

  const nextVideo = () => setCurrentVideo((prev) => (prev + 1) % videos.length);
  const prevVideo = () =>
    setCurrentVideo((prev) => (prev - 1 + videos.length) % videos.length);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-800 transition-all">
      <Card className="p-6 shadow-xl max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Cat className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">{goal.title}</h1>
        </div>

        <p className="mb-1 text-gray-600 dark:text-gray-300">
          Target Amount: RM {goal.targetAmount.toFixed(2)}
        </p>
        <p className="mb-2 text-gray-600 dark:text-gray-300">
          Current Amount: RM {goal.currentAmount.toFixed(2)}
        </p>
        {goal.deadline && (
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Deadline: {goal.deadline}
          </p>
        )}

        {/* Combined Progress */}
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" /> Combined Progress
          </h2>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress.toFixed(1)}%` }}
            ></div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            RM {totalContribution.toFixed(2)} / RM{" "}
            {goal.targetAmount.toFixed(2)} ({progress.toFixed(1)}% complete)
          </p>
        </div>

        {/* Member Progress */}
        {goal.members && goal.members.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold mb-3">Member Contributions</h2>
            <div className="space-y-3">
              {goal.members.map((m, idx) => {
                const percent =
                  ((m.contribution || 0) / goal.targetAmount) * 100;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{m.name}</span>
                      <span>
                        RM {m.contribution?.toFixed(2) || 0} (
                        {percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pie Chart */}
        <div className="mb-8">
          <h2 className="font-semibold mb-2">Contribution Distribution</h2>
          <div className="max-w-xs mx-auto">
            <Pie data={pieData} />
          </div>
        </div>

        {/* Notes Section */}
        <div className="mb-8">
          <h2 className="font-semibold mb-3">💌 Our Savings Journey</h2>
          <Textarea
            placeholder="Write a sweet note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="mb-2"
          />
          <Button onClick={addNote} className="mb-4">
            ➕ Add Note
          </Button>
          <div className="space-y-3">
            {notes.map((note, i) => (
              <div
                key={i}
                className="bg-pink-100 dark:bg-pink-900/40 p-3 rounded-lg whitespace-pre-line"
              >
                {note}
              </div>
            ))}
          </div>
        </div>

        {/* Video Slideshow */}
        {videos.length > 0 && (
          <div className="mb-8 relative">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Video className="w-5 h-5 text-rose-500" /> 🎥 Our Video Memories
            </h2>
            <div className="aspect-video rounded-lg overflow-hidden relative">
              <iframe
                src={videos[currentVideo]}
                title="Saving Video"
                className="w-full h-full"
                allow="autoplay; encrypted-media"
              ></iframe>
              {videos.length > 1 && (
                <>
                  <button
                    onClick={prevVideo}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white p-1 rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={nextVideo}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white p-1 rounded-full"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Add New Video */}
        <div className="mb-8">
          <Input
            placeholder="Paste YouTube or video URL..."
            value={newVideo}
            onChange={(e) => setNewVideo(e.target.value)}
            className="mb-2"
          />
          <Button onClick={addVideo} className="mb-4">
            ➕ Add Video
          </Button>
        </div>

        {/* Picture Memories */}
        <div className="mb-8">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <ImagePlus className="w-5 h-5 text-pink-600" /> 💕 Our Memories
          </h2>
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={addPicture}
            className="mb-4"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pictures.map((pic, i) => (
              <img
                key={i}
                src={pic}
                alt={`Memory ${i}`}
                className="rounded-lg shadow-md object-cover w-full h-40"
              />
            ))}
          </div>
        </div>

        {/* Back Button */}
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </Card>
    </div>
  );
};

export default SavingDetails;
