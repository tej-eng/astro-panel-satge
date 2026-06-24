"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";

import {
  START_LIVE,
  END_LIVE,
  JOIN_LIVE,
  SCHEDULE_LIVE,
  GET_MY_SCHEDULED_LIVES,
} from "@/app/utils/panelQueries";

import AgoraRTC from "agora-rtc-sdk-ng";

const client = AgoraRTC.createClient({
  mode: "live",
  codec: "vp8",
});

export default function AgentLiveStreaming() {
  const [title, setTitle] = useState("");
  const [streamId, setStreamId] =
    useState(null);

  const [isLive, setIsLive] =
    useState(false);

  const [micTrack, setMicTrack] =
    useState(null);

  const [cameraTrack, setCameraTrack] =
    useState(null);

  const [scheduleTitle, setScheduleTitle] =
    useState("");

  const [scheduleDate, setScheduleDate] =
    useState("");

  const [scheduleTime, setScheduleTime] =
    useState("");

  const { data, refetch } = useQuery(
    GET_MY_SCHEDULED_LIVES,
    {
      fetchPolicy: "network-only",
    }
  );

  const scheduledLives =
    data?.getMyScheduledLives || [];

  const [startLive] =
    useMutation(START_LIVE);

  const [endLive] =
    useMutation(END_LIVE);

  const [joinLive] =
    useMutation(JOIN_LIVE);

  const [scheduleLive, { loading: scheduling }] =
    useMutation(SCHEDULE_LIVE);

  const handleStartLive =
    async () => {
      try {
        if (!title.trim()) {
          alert("Enter stream title");
          return;
        }

        const {
          data: startData,
        } = await startLive({
          variables: {
            title,
          },
        });

        const stream =
          startData.startLive;

        setStreamId(stream.id);

        const {
          data: joinData,
        } = await joinLive({
          variables: {
            channelName:
              stream.channelName,
            role: "publisher",
          },
        });

        const live =
          joinData.joinLive;

        await client.setClientRole(
          "host"
        );

        await client.join(
          live.appId,
          live.channelName,
          live.token,
          live.uid
        );

        const mic =
          await AgoraRTC.createMicrophoneAudioTrack();

        const camera =
          await AgoraRTC.createCameraVideoTrack();

        await client.publish([
          mic,
          camera,
        ]);

        camera.play(
          "local-player"
        );

        setMicTrack(mic);
        setCameraTrack(camera);

        setIsLive(true);

        alert(
          "Live started successfully"
        );
      } catch (error) {
        console.error(error);

        alert(
          error.message ||
            "Failed to start live"
        );
      }
    };

  const handleEndLive =
    async () => {
      try {
        if (cameraTrack)
          cameraTrack.close();

        if (micTrack)
          micTrack.close();

        await client.leave();

        await endLive({
          variables: {
            streamId,
          },
        });

        setIsLive(false);
        setStreamId(null);

        alert(
          "Live ended successfully"
        );
      } catch (error) {
        console.error(error);
      }
    };

  const handleSchedule =
    async () => {
      try {
        if (
          !scheduleTitle ||
          !scheduleDate ||
          !scheduleTime
        ) {
          alert("Fill all fields");
          return;
        }

        const scheduledAt =
          new Date(
            `${scheduleDate}T${scheduleTime}`
          ).toISOString();

        await scheduleLive({
          variables: {
            title: scheduleTitle,
            scheduledAt,
          },
        });

        await refetch();

        setScheduleTitle("");
        setScheduleDate("");
        setScheduleTime("");

        alert(
          "Live scheduled successfully"
        );
      } catch (error) {
        console.error(error);

        alert(
          error.message ||
            "Failed to schedule live"
        );
      }
    };

  return (
    <div className="p-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              Live Streaming
            </h2>

            {isLive ? (
              <span className="px-4 py-2 rounded-full bg-red-500 text-white animate-pulse">
                LIVE
              </span>
            ) : (
              <span className="px-4 py-2 rounded-full bg-gray-200">
                OFFLINE
              </span>
            )}
          </div>

          <input
            className="w-full border rounded-lg p-3 mb-4"
            placeholder="Enter Live Title"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
          />

          <div
            id="local-player"
            className="w-full h-[500px] rounded-xl overflow-hidden bg-black"
          />

          <div className="flex gap-4 mt-5">
            {!isLive ? (
              <button
                onClick={
                  handleStartLive
                }
                className="bg-red-600 text-white px-6 py-3 rounded-lg"
              >
                Start Live Now
              </button>
            ) : (
              <button
                onClick={
                  handleEndLive
                }
                className="bg-black text-white px-6 py-3 rounded-lg"
              >
                End Live
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-xl font-bold mb-4">
              Schedule Live
            </h3>

            <input
              value={
                scheduleTitle
              }
              onChange={(e) =>
                setScheduleTitle(
                  e.target.value
                )
              }
              placeholder="Live Title"
              className="w-full border rounded-lg p-3 mb-3"
            />

            <input
              type="date"
              value={
                scheduleDate
              }
              onChange={(e) =>
                setScheduleDate(
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3 mb-3"
            />

            <input
              type="time"
              value={
                scheduleTime
              }
              onChange={(e) =>
                setScheduleTime(
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3 mb-4"
            />

            <button
              disabled={scheduling}
              onClick={
                handleSchedule
              }
              className="w-full bg-blue-600 text-white py-3 rounded-lg"
            >
              {scheduling
                ? "Scheduling..."
                : "Schedule Live"}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-xl font-bold mb-4">
              Upcoming Lives
            </h3>

            {scheduledLives.length ===
            0 ? (
              <p>
                No scheduled lives
              </p>
            ) : (
              scheduledLives.map(
                (live) => (
                  <div
                    key={live.id}
                    className="border rounded-lg p-3 mb-3"
                  >
                    <h4 className="font-semibold">
                      {live.title}
                    </h4>

                    <p>
                      📅{" "}
                      {new Date(
                        Number(
                          live.scheduledAt
                        )
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </p>

                    <p>
                      ⏰{" "}
                      {new Date(
                        Number(
                          live.scheduledAt
                        )
                      ).toLocaleTimeString(
                        "en-IN"
                      )}
                    </p>

                    <p className="text-sm text-blue-600 mt-1">
                      {live.status}
                    </p>
                  </div>
                )
              )
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-xl font-bold mb-4">
              Statistics
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-100 p-3 rounded-lg">
                <p>Total Viewers</p>
                <h2 className="text-2xl font-bold">
                  0
                </h2>
              </div>

              <div className="bg-gray-100 p-3 rounded-lg">
                <p>Status</p>

                <h2 className="text-xl font-bold">
                  {isLive
                    ? "LIVE"
                    : "OFFLINE"}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}