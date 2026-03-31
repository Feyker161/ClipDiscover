import type { TwitchFeedClip } from '@/lib/twitch-api'

// TODO: later replace with real Twitch Helix API + Supabase auth
export const mockClips: TwitchFeedClip[] = [
  {
    id: 'clip_01',
    slug: 'BlazingFastMoment123',
    title: 'Insane reaction time… how did he hit that?',
    streamer: {
      id: 'streamer_01',
      name: 'NightShiftGG',
      avatarUrl: 'https://i.pravatar.cc/96?img=12',
    },
    views: 248_193,
    durationSeconds: 29,
  },
  {
    id: 'clip_02',
    slug: 'FunnyFail456',
    title: 'Chat baited me and I paid the price',
    streamer: {
      id: 'streamer_02',
      name: 'LunaPlays',
      avatarUrl: 'https://i.pravatar.cc/96?img=32',
    },
    views: 1_048_771,
    durationSeconds: 17,
  },
  {
    id: 'clip_03',
    slug: 'OneHPClutch789',
    title: '1 HP clutch into instant scream',
    streamer: {
      id: 'streamer_03',
      name: 'PixelPanic',
      avatarUrl: 'https://i.pravatar.cc/96?img=5',
    },
    views: 612_011,
    durationSeconds: 23,
  },
  {
    id: 'clip_04',
    slug: 'UnexpectedTech000',
    title: 'Accidental tech discovered live (we kept doing it)',
    streamer: {
      id: 'streamer_04',
      name: 'RogueMechanic',
      avatarUrl: 'https://i.pravatar.cc/96?img=44',
    },
    views: 93_022,
    durationSeconds: 31,
  },
  {
    id: 'clip_05',
    slug: 'PerfectTiming321',
    title: 'Perfect timing — the whole lobby froze',
    streamer: {
      id: 'streamer_05',
      name: 'AstraEcho',
      avatarUrl: 'https://i.pravatar.cc/96?img=20',
    },
    views: 407_954,
    durationSeconds: 21,
  },
  {
    id: 'clip_06',
    slug: 'ChatGoesWild654',
    title: 'Chat goes wild when the drop finally hits',
    streamer: {
      id: 'streamer_06',
      name: 'DJByte',
      avatarUrl: 'https://i.pravatar.cc/96?img=58',
    },
    views: 189_331,
    durationSeconds: 26,
  },
  {
    id: 'clip_07',
    slug: 'ZeroToHero987',
    title: 'Zero to hero in 10 seconds',
    streamer: {
      id: 'streamer_07',
      name: 'KairoK',
      avatarUrl: 'https://i.pravatar.cc/96?img=15',
    },
    views: 2_201_499,
    durationSeconds: 14,
  },
  {
    id: 'clip_08',
    slug: 'ScuffedButWorks222',
    title: 'Scuffed strat… but it WORKS',
    streamer: {
      id: 'streamer_08',
      name: 'MangoMeta',
      avatarUrl: 'https://i.pravatar.cc/96?img=9',
    },
    views: 73_902,
    durationSeconds: 28,
  },
  {
    id: 'clip_09',
    slug: 'ControllerAimGod333',
    title: 'Controller aim doesn’t miss today',
    streamer: {
      id: 'streamer_09',
      name: 'AimAssistAndy',
      avatarUrl: 'https://i.pravatar.cc/96?img=27',
    },
    views: 535_111,
    durationSeconds: 19,
  },
  {
    id: 'clip_10',
    slug: 'NoContextChaos444',
    title: 'No context needed… just chaos',
    streamer: {
      id: 'streamer_10',
      name: 'WaffleWizard',
      avatarUrl: 'https://i.pravatar.cc/96?img=36',
    },
    views: 121_776,
    durationSeconds: 24,
  },
]

