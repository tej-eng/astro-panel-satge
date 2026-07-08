"use client";

<<<<<<< Updated upstream
import { useState } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> Stashed changes
import {
  useMutation,
  useQuery,
  useLazyQuery,
} from "@apollo/client/react";

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
<<<<<<< Updated upstream
  const [streamId, setStreamId] = useState(null);

  const [isLive, setIsLive] = useState(false);

  const [micTrack, setMicTrack] = useState(null);
  const [cameraTrack, setCameraTrack] = useState(null);
=======

  const [streamId, setStreamId] =
    useState(null);

  const [isLive, setIsLive] =
    useState(false);
>>>>>>> Stashed changes

  const [scheduleTitle, setScheduleTitle] =
    useState("");

  const [scheduleDate, setScheduleDate] =
    useState("");

  const [scheduleTime, setScheduleTime] =
    useState("");

<<<<<<< Updated upstream
  const { data, refetch } = useQuery(
=======
  const [micTrack, setMicTrack] =
    useState(null);

  const [cameraTrack, setCameraTrack] =
    useState(null);

  /* ==========================
      QUERIES
  ========================== */

  const {
    data: scheduledData,
    loading: scheduledLoading,
    refetch: refetchScheduledLives,
  } = useQuery(
>>>>>>> Stashed changes
    GET_MY_SCHEDULED_LIVES,
    {
      fetchPolicy: "network-only",
    }
  );

<<<<<<< Updated upstream
  const scheduledLives =
    data?.getMyScheduledLives || [];
=======
  const [joinLive] =
    useLazyQuery(JOIN_LIVE);

  /* ==========================
      MUTATIONS
  ========================== */
>>>>>>> Stashed changes

  const [startLive] =
    useMutation(START_LIVE);

  const [endLive] =
    useMutation(END_LIVE);

<<<<<<< Updated upstream
  // FIXED: joinLive is Query, not Mutation
  const [joinLive] =
    useLazyQuery(JOIN_LIVE);

  const [
    scheduleLive,
    { loading: scheduling },
  ] = useMutation(SCHEDULE_LIVE);
=======
  const [scheduleLiveMutation] =
    useMutation(SCHEDULE_LIVE);

  /* ==========================
      DATA
  ========================== */

  const scheduledLives =
    scheduledData?.getMyScheduledLives ||
    [];

  /* ==========================
      START LIVE
  ========================== */
>>>>>>> Stashed changes

  const handleStartLive =
    async () => {
      try {
        if (!title.trim()) {
<<<<<<< Updated upstream
          alert("Enter stream title");
          return;
        }

        const { data: startData } =
          await startLive({
            variables: {
              title,
            },
          });
=======
          alert(
            "Please enter live title"
          );
          return;
        }

        const {
          data: startData,
        } = await startLive({
          variables: {
            title,
          },
        });
>>>>>>> Stashed changes

        const stream =
          startData?.startLive;

        if (!stream) {
          throw new Error(
<<<<<<< Updated upstream
            "Unable to start live"
=======
            "Unable to create stream"
>>>>>>> Stashed changes
          );
        }

        setStreamId(stream.id);

<<<<<<< Updated upstream
        const { data: joinData } =
          await joinLive({
            variables: {
              channelName:
                stream.channelName,
              role: "publisher",
            },
          });

        const live =
          joinData?.joinLive;
=======
        const {
          data: tokenData,
        } = await joinLive({
          variables: {
            channelName:
              stream.channelName,
            role: "publisher",
          },
        });

        const live =
          tokenData?.joinLive;
>>>>>>> Stashed changes

        if (!live) {
          throw new Error(
            "Unable to join live"
          );
        }

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

<<<<<<< Updated upstream
        alert(
          "Live started successfully"
        );
      } catch (error) {
        console.error(error);

        alert(
          error?.message ||
            error?.graphQLErrors?.[0]
              ?.message ||
=======
        refetchScheduledLives();
      } catch (error) {
        console.log(error);

        alert(
          error?.message ||
>>>>>>> Stashed changes
            "Failed to start live"
        );
      }
    };

<<<<<<< Updated upstream
=======
  /* ==========================
      END LIVE
  ========================== */

>>>>>>> Stashed changes
  const handleEndLive =
    async () => {
      try {
        if (cameraTrack) {
<<<<<<< Updated upstream
          cameraTrack.stop();
=======
>>>>>>> Stashed changes
          cameraTrack.close();
        }

        if (micTrack) {
<<<<<<< Updated upstream
          micTrack.stop();
=======
>>>>>>> Stashed changes
          micTrack.close();
        }

        await client.leave();

<<<<<<< Updated upstream
        if (streamId) {
          await endLive({
            variables: {
              streamId,
            },
          });
        }

        setCameraTrack(null);
        setMicTrack(null);

        setIsLive(false);
        setStreamId(null);

        alert(
          "Live ended successfully"
        );
      } catch (error) {
        console.error(error);

        alert(
          error?.message ||
            "Failed to end live"
        );
      }
    };

=======
        await endLive({
          variables: {
            streamId,
          },
        });

        setStreamId(null);
        setIsLive(false);

        refetchScheduledLives();
      } catch (error) {
        console.log(error);
      }
    };

  /* ==========================
      SCHEDULE LIVE
  ========================== */

>>>>>>> Stashed changes
  const handleSchedule =
    async () => {
      try {
        if (
          !scheduleTitle ||
          !scheduleDate ||
          !scheduleTime
        ) {
<<<<<<< Updated upstream
          alert("Fill all fields");
=======
          alert(
            "Please fill all fields"
          );
>>>>>>> Stashed changes
          return;
        }

        const scheduledAt =
          new Date(
            `${scheduleDate}T${scheduleTime}`
          ).toISOString();

<<<<<<< Updated upstream
        await scheduleLive({
=======
        await scheduleLiveMutation({
>>>>>>> Stashed changes
          variables: {
            title: scheduleTitle,
            scheduledAt,
          },
        });

<<<<<<< Updated upstream
        await refetch();

=======
>>>>>>> Stashed changes
        setScheduleTitle("");
        setScheduleDate("");
        setScheduleTime("");

<<<<<<< Updated upstream
=======
        refetchScheduledLives();

>>>>>>> Stashed changes
        alert(
          "Live scheduled successfully"
        );
      } catch (error) {
<<<<<<< Updated upstream
        console.error(error);

        alert(
          error?.message ||
            error?.graphQLErrors?.[0]
              ?.message ||
=======
        console.log(error);

        alert(
          error?.message ||
>>>>>>> Stashed changes
            "Failed to schedule live"
        );
      }
    };
<<<<<<< Updated upstream

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
=======

  /* ==========================
      CLEANUP
  ========================== */

  useEffect(() => {
    return () => {
      if (cameraTrack)
        cameraTrack.close();

      if (micTrack)
        micTrack.close();

      client.leave();
    };
  }, [cameraTrack, micTrack]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT SECTION */}

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold">
              Live Streaming Studio
            </h2>

            {isLive ? (
              <span className="px-4 py-2 bg-red-500 text-white rounded-full animate-pulse">
                🔴 LIVE
              </span>
            ) : (
              <span className="px-4 py-2 bg-gray-200 rounded-full">
                ⚫ OFFLINE
>>>>>>> Stashed changes
              </span>
            )}
          </div>

          <input
<<<<<<< Updated upstream
            className="w-full border rounded-lg p-3 mb-4"
            placeholder="Enter Live Title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
=======
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
            placeholder="Enter Live Title"
            className="w-full border rounded-lg p-3 mb-4"
>>>>>>> Stashed changes
          />

          <div
            id="local-player"
<<<<<<< Updated upstream
            className="w-full h-[500px] rounded-xl overflow-hidden bg-black"
          />

          <div className="flex gap-4 mt-5">
=======
            className="w-full h-[500px] bg-black rounded-xl overflow-hidden"
          />

          <div className="mt-5">
>>>>>>> Stashed changes
            {!isLive ? (
              <button
                onClick={
                  handleStartLive
                }
<<<<<<< Updated upstream
                className="bg-red-600 text-white px-6 py-3 rounded-lg"
=======
                className="bg-red-600 text-white px-8 py-3 rounded-xl"
>>>>>>> Stashed changes
              >
                Start Live Now
              </button>
            ) : (
              <button
                onClick={
                  handleEndLive
                }
<<<<<<< Updated upstream
                className="bg-black text-white px-6 py-3 rounded-lg"
=======
                className="bg-black text-white px-8 py-3 rounded-xl"
>>>>>>> Stashed changes
              >
                End Live
              </button>
            )}
          </div>
        </div>

<<<<<<< Updated upstream
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-xl font-bold mb-4">
=======
        {/* RIGHT SECTION */}

        <div className="space-y-6">
          {/* SCHEDULE */}

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h3 className="font-bold text-xl mb-4">
>>>>>>> Stashed changes
              Schedule Live
            </h3>

            <input
<<<<<<< Updated upstream
              value={
                scheduleTitle
              }
=======
              value={scheduleTitle}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
              value={
                scheduleDate
              }
=======
              value={scheduleDate}
>>>>>>> Stashed changes
              onChange={(e) =>
                setScheduleDate(
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3 mb-3"
            />

            <input
              type="time"
<<<<<<< Updated upstream
              value={
                scheduleTime
              }
=======
              value={scheduleTime}
>>>>>>> Stashed changes
              onChange={(e) =>
                setScheduleTime(
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3 mb-4"
            />

            <button
<<<<<<< Updated upstream
              disabled={scheduling}
=======
>>>>>>> Stashed changes
              onClick={
                handleSchedule
              }
              className="w-full bg-blue-600 text-white py-3 rounded-lg"
            >
<<<<<<< Updated upstream
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
=======
              Schedule Live
            </button>
          </div>

          {/* UPCOMING LIVES */}

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h3 className="font-bold text-xl mb-4">
              Upcoming Lives
            </h3>

            {scheduledLoading ? (
              <p>
                Loading scheduled
                lives...
              </p>
            ) : scheduledLives.length ===
              0 ? (
>>>>>>> Stashed changes
              <p>
                No scheduled lives
              </p>
            ) : (
              scheduledLives.map(
                (live) => (
                  <div
                    key={live.id}
<<<<<<< Updated upstream
                    className="border rounded-lg p-3 mb-3"
                  >
                    <h4 className="font-semibold">
                      {live.title}
                    </h4>

                    <p>
                      📅{" "}
                      {new Date(
                        live.scheduledAt
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </p>

                    <p>
                      ⏰{" "}
                      {new Date(
                        live.scheduledAt
                      ).toLocaleTimeString(
                        "en-IN"
                      )}
                    </p>

                    <p className="text-sm text-blue-600 mt-1">
                      {live.status}
=======
                    className="border rounded-xl p-4 mb-3"
                  >
                    <div className="flex justify-between">
                      <h4 className="font-semibold">
                        {live.title}
                      </h4>

                      <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                        {
                          live.status
                        }
                      </span>
                    </div>

                    <p className="mt-2 text-sm">
                      📅{" "}
                     {new Date(Number(live.scheduledAt)).toLocaleDateString("en-IN")}
                    </p>

                    <p className="text-sm">
                      ⏰{" "}
                     {new Date(Number(live.scheduledAt)).toLocaleTimeString()}
>>>>>>> Stashed changes
                    </p>
                  </div>
                )
              )
            )}
          </div>

<<<<<<< Updated upstream
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-xl font-bold mb-4">
=======
          {/* STATS */}

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h3 className="font-bold text-xl mb-4">
>>>>>>> Stashed changes
              Statistics
            </h3>

            <div className="grid grid-cols-2 gap-3">
<<<<<<< Updated upstream
              <div className="bg-gray-100 p-3 rounded-lg">
                <p>Total Viewers</p>
=======
              <div className="bg-gray-100 p-4 rounded-lg">
                <p>Total Viewers</p>

>>>>>>> Stashed changes
                <h2 className="text-2xl font-bold">
                  0
                </h2>
              </div>

<<<<<<< Updated upstream
              <div className="bg-gray-100 p-3 rounded-lg">
                <p>Status</p>

                <h2 className="text-xl font-bold">
                  {isLive
                    ? "LIVE"
                    : "OFFLINE"}
=======
              <div className="bg-gray-100 p-4 rounded-lg">
                <p>Live Status</p>

                <h2
                  className={`text-xl font-bold ${
                    isLive
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {isLive
                    ? "🔴 LIVE"
                    : "⚫ OFFLINE"}
>>>>>>> Stashed changes
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}