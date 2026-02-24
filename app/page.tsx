'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FiSearch, FiZap, FiFileText, FiVideo, FiSend, FiBarChart2, FiTarget,
  FiChevronDown, FiChevronRight, FiCheck, FiX, FiAlertTriangle, FiActivity,
  FiHome, FiBookmark, FiEdit3, FiCalendar, FiTrendingUp, FiFilter, FiRefreshCw,
  FiLoader, FiExternalLink, FiChevronUp
} from 'react-icons/fi'

// ─── AGENT IDS ───────────────────────────────────────────────────
const AGENT_IDS = {
  trendScout: '699da78a1ff1ae52f0fc4836',
  hookLab: '699da7ee1581246eff69d3df',
  scriptEngine: '699da7efc9d1ec5e71789904',
  production: '699da7ef4d9b8b973a73e422',
  distribution: '699da7ef1581246eff69d3e1',
  analytics: '699da7f0c9d1ec5e71789906',
  funnelOptimizer: '699da7f07c54a9ee105c172e',
}

// ─── TYPES ───────────────────────────────────────────────────────
type SectionKey = 'command' | 'hooks' | 'scripts' | 'render' | 'distribution' | 'analytics' | 'funnel'
type BrandKey = 'all' | 'newborns' | 'toddlers' | 'teenagers'
type AgentKey = keyof typeof AGENT_IDS

interface AgentState {
  loading: boolean
  data: any
  error: string | null
  lastRun: string | null
}

interface InspirationBrief {
  trend_title: string
  source_platform: string
  hook_pattern: string
  emotional_trigger: string
  content_angle: string
  brand_fit_score: number
  target_niche: string
  compliance_notes: string
  suggested_adaptation: string
}

interface HookItem {
  hook_text: string
  pillar: string
  format: string
  cta_type: string
  predicted_intent: string
  compliance_risk: string
  source_trend: string
}

interface ScriptItem {
  script_id: string
  hook_text: string
  brand: string
  full_script: string
  hook_section: string
  core_insight: string
  say_this_instead: string
  cta_text: string
  cta_type: string
  duration_estimate: string
  compliance_status: string
  captions: { instagram: string; tiktok: string; youtube_shorts: string; facebook: string }
}

interface RenderJob {
  job_id: string
  script_id: string
  brand: string
  status: string
  voice_config: { voice_id: string; tone: string; speed: string }
  render_specs: { resolution: string; duration: string; subtitle_style: string; has_outro: boolean }
  asset_url: string
  fallback_pack: string
  error_message: string
}

interface SchedulePost {
  post_id: string
  brand: string
  platform: string
  scheduled_time: string
  caption: string
  hashtags: string
  video_reference: string
  status: string
}

interface Winner { post_id: string; hook: string; brand: string; weighted_score: number; top_metric: string }
interface Loser { post_id: string; hook: string; brand: string; weighted_score: number; issue: string }

interface FunnelBrand { quiz_ctr: number; completion_rate: number; optin_rate: number; conversion_rate: number; weakest_point: string }

interface ABTest {
  test_id: string; brand: string; funnel_stage: string; control_description: string
  variant_description: string; expected_impact: string; sample_size: number; duration_days: number
}

// ─── SAMPLE DATA ─────────────────────────────────────────────────
const SAMPLE_TREND_DATA = {
  inspiration_briefs: [
    { trend_title: 'The 3am Feed Reality Check', source_platform: 'TikTok', hook_pattern: 'Nobody tells you about...', emotional_trigger: 'Validation', content_angle: 'Raw honesty about newborn nights', brand_fit_score: 92, target_niche: 'newborns', compliance_notes: 'No medical claims', suggested_adaptation: 'Use dim lighting B-roll with whispered voiceover' },
    { trend_title: 'Toddler Meal Prep Hack', source_platform: 'Instagram Reels', hook_pattern: 'Stop doing X, try Y instead', emotional_trigger: 'Relief', content_angle: 'Time-saving meal solutions', brand_fit_score: 88, target_niche: 'toddlers', compliance_notes: 'Avoid nutrition claims', suggested_adaptation: 'Show side-by-side prep comparison' },
    { trend_title: 'Screen Time Debate Reframe', source_platform: 'YouTube Shorts', hook_pattern: 'Unpopular opinion:', emotional_trigger: 'Curiosity', content_angle: 'Balanced tech approach for teens', brand_fit_score: 85, target_niche: 'teenagers', compliance_notes: 'Cite research if mentioning studies', suggested_adaptation: 'Include teen reaction clips' },
    { trend_title: 'Gentle Parenting Myth Bust', source_platform: 'Facebook Reels', hook_pattern: 'You think X but actually Y', emotional_trigger: 'Surprise', content_angle: 'Debunking gentle parenting misconceptions', brand_fit_score: 90, target_niche: 'toddlers', compliance_notes: 'No shaming other styles', suggested_adaptation: 'Use split screen with common vs real scenarios' },
    { trend_title: 'First Year Milestones Tracker', source_platform: 'TikTok', hook_pattern: 'Month X vs Month Y', emotional_trigger: 'Nostalgia', content_angle: 'Baby development visual timeline', brand_fit_score: 94, target_niche: 'newborns', compliance_notes: 'Disclaimer: every baby develops differently', suggested_adaptation: 'Photo montage with growth overlay' },
  ],
  summary: 'This week shows strong performance in raw honesty content for newborns, practical hacks for toddlers, and debate-style hooks for teenagers. Validation and relief remain the dominant emotional triggers across all niches.',
  research_date: '2026-02-24'
}

const SAMPLE_HOOKS_DATA = {
  hooks_by_brand: {
    newborns: [
      { hook_text: 'I wish someone told me this before my baby arrived', pillar: 'Education', format: 'Talking Head', cta_type: 'Quiz', predicted_intent: 'Save', compliance_risk: 'LOW', source_trend: '3am Feed Reality Check' },
      { hook_text: 'The one thing every new parent gets wrong about sleep', pillar: 'Myth Bust', format: 'Green Screen', cta_type: 'Link', predicted_intent: 'Share', compliance_risk: 'MEDIUM', source_trend: 'Sleep Training Debate' },
      { hook_text: 'Your pediatrician wont tell you this about feeding', pillar: 'Insider Tips', format: 'Voiceover B-roll', cta_type: 'Quiz', predicted_intent: 'Comment', compliance_risk: 'HIGH', source_trend: 'Feeding Myths' },
    ],
    toddlers: [
      { hook_text: 'Stop buying expensive toys, do this instead', pillar: 'Budget Hacks', format: 'Demonstration', cta_type: 'Link', predicted_intent: 'Save', compliance_risk: 'LOW', source_trend: 'Toddler Meal Prep Hack' },
      { hook_text: 'The tantrum hack that changed our mornings', pillar: 'Behavior', format: 'Story Time', cta_type: 'Quiz', predicted_intent: 'Share', compliance_risk: 'LOW', source_trend: 'Gentle Parenting Myth Bust' },
    ],
    teenagers: [
      { hook_text: 'My teenager said this and I was speechless', pillar: 'Communication', format: 'Talking Head', cta_type: 'Comment CTA', predicted_intent: 'Comment', compliance_risk: 'LOW', source_trend: 'Screen Time Debate Reframe' },
      { hook_text: 'If your teen does this, pay attention', pillar: 'Mental Health', format: 'Text Overlay', cta_type: 'Quiz', predicted_intent: 'Save', compliance_risk: 'MEDIUM', source_trend: 'Teen Mental Health Signs' },
    ],
  },
  generation_stats: { total_hooks: 150, high_risk_count: 8, medium_risk_count: 23, low_risk_count: 119 }
}

const SAMPLE_SCRIPTS_DATA = {
  scripts: [
    { script_id: 'SCR-001', hook_text: 'I wish someone told me this before my baby arrived', brand: 'newborns', full_script: 'Hook: I wish someone told me this before my baby arrived.\n\nCore: The first two weeks are survival mode. You will not sleep, eat, or shower normally. And thats okay.\n\nInsight: Studies show 78% of new parents feel unprepared despite reading every book.\n\nCTA: Take our quiz to see how prepared you really are.', hook_section: 'I wish someone told me this before my baby arrived', core_insight: '78% of new parents feel unprepared', say_this_instead: 'Instead of its easy, say its hard but worth it', cta_text: 'Take our quiz to see how prepared you really are', cta_type: 'Quiz', duration_estimate: '28s', compliance_status: 'Approved', captions: { instagram: 'The truth about those first weeks nobody shares. Link in bio for the quiz.', tiktok: 'POV: what they dont tell you at the hospital #newborn #parentingtips', youtube_shorts: 'What I wish I knew before becoming a parent - honest take', facebook: 'Real talk for expecting parents. Take our preparation quiz below.' } },
    { script_id: 'SCR-002', hook_text: 'Stop buying expensive toys, do this instead', brand: 'toddlers', full_script: 'Hook: Stop buying expensive toys. Do this instead.\n\nCore: Your toddler learns more from a cardboard box than a $50 toy. Heres why.\n\nInsight: Open-ended play builds 3x more neural connections than structured toys.\n\nCTA: Get our free play guide - link in bio.', hook_section: 'Stop buying expensive toys. Do this instead.', core_insight: 'Open-ended play builds 3x more neural connections', say_this_instead: 'Instead of educational toy, say exploration material', cta_text: 'Get our free play guide - link in bio', cta_type: 'Link', duration_estimate: '24s', compliance_status: 'Review', captions: { instagram: 'Save your money and boost their development. Free guide in bio!', tiktok: 'POV: your toddler prefers the box over the toy #toddlermom #parentinghack', youtube_shorts: 'Why expensive toys are a waste - what actually helps development', facebook: 'Parents, save your money! Download our free play guide below.' } },
  ],
  total_scripts: 14,
  brand_breakdown: { newborns: 5, toddlers: 5, teenagers: 4 }
}

const SAMPLE_PRODUCTION_DATA = {
  render_jobs: [
    { job_id: 'RND-001', script_id: 'SCR-001', brand: 'newborns', status: 'completed', voice_config: { voice_id: 'sarah-warm', tone: 'Empathetic', speed: '0.95x' }, render_specs: { resolution: '1080x1920', duration: '28s', subtitle_style: 'Bold White', has_outro: true }, asset_url: 'https://cdn.example.com/render/RND-001.mp4', fallback_pack: 'newborn-pack-v3', error_message: '' },
    { job_id: 'RND-002', script_id: 'SCR-002', brand: 'toddlers', status: 'rendering', voice_config: { voice_id: 'mike-casual', tone: 'Friendly', speed: '1.0x' }, render_specs: { resolution: '1080x1920', duration: '24s', subtitle_style: 'Colorful Pop', has_outro: true }, asset_url: '', fallback_pack: 'toddler-pack-v2', error_message: '' },
    { job_id: 'RND-003', script_id: 'SCR-003', brand: 'teenagers', status: 'queued', voice_config: { voice_id: 'alex-chill', tone: 'Relatable', speed: '1.05x' }, render_specs: { resolution: '1080x1920', duration: '32s', subtitle_style: 'Minimal Clean', has_outro: false }, asset_url: '', fallback_pack: 'teen-pack-v1', error_message: '' },
    { job_id: 'RND-004', script_id: 'SCR-004', brand: 'newborns', status: 'failed', voice_config: { voice_id: 'sarah-warm', tone: 'Empathetic', speed: '0.95x' }, render_specs: { resolution: '1080x1920', duration: '30s', subtitle_style: 'Bold White', has_outro: true }, asset_url: '', fallback_pack: 'newborn-pack-v3', error_message: 'Voice synthesis timeout - retry recommended' },
  ],
  batch_summary: { total_jobs: 14, completed: 8, failed: 2, queued: 4 }
}

const SAMPLE_DISTRIBUTION_DATA = {
  schedule: [
    { post_id: 'POST-001', brand: 'newborns', platform: 'TikTok', scheduled_time: '2026-02-25T09:00:00Z', caption: 'POV: what they dont tell you at the hospital', hashtags: '#newborn #parentingtips #newmom', video_reference: 'RND-001', status: 'scheduled' },
    { post_id: 'POST-002', brand: 'newborns', platform: 'Instagram', scheduled_time: '2026-02-25T12:00:00Z', caption: 'The truth about those first weeks nobody shares', hashtags: '#newbornlife #momlife #realtalk', video_reference: 'RND-001', status: 'scheduled' },
    { post_id: 'POST-003', brand: 'toddlers', platform: 'TikTok', scheduled_time: '2026-02-25T10:30:00Z', caption: 'POV: your toddler prefers the box over the toy', hashtags: '#toddlermom #parentinghack #playtime', video_reference: 'RND-002', status: 'pending' },
    { post_id: 'POST-004', brand: 'teenagers', platform: 'YouTube', scheduled_time: '2026-02-26T14:00:00Z', caption: 'If your teen does this, its a sign', hashtags: '#teenparenting #parentingtips #teenagers', video_reference: 'RND-003', status: 'draft' },
    { post_id: 'POST-005', brand: 'toddlers', platform: 'Facebook', scheduled_time: '2026-02-26T11:00:00Z', caption: 'Parents, save your money! Free guide below.', hashtags: '#toddlerplay #parentingwin', video_reference: 'RND-002', status: 'scheduled' },
  ],
  distribution_summary: {
    total_posts: 42,
    by_brand: { newborns: 16, toddlers: 14, teenagers: 12 },
    by_platform: { tiktok: 14, instagram: 12, youtube: 8, facebook: 8 }
  }
}

const SAMPLE_ANALYTICS_DATA = {
  kpis: { saves_per_1k: 42.3, shares_per_1k: 18.7, follows_per_1k: 8.2, completion_rate: 67.4, quiz_ctr: 4.8, rpm: 12.50 },
  winners: [
    { post_id: 'POST-112', hook: 'I wish someone told me this before my baby arrived', brand: 'newborns', weighted_score: 94.2, top_metric: 'Saves (68/1k)' },
    { post_id: 'POST-089', hook: 'The tantrum hack that changed our mornings', brand: 'toddlers', weighted_score: 91.5, top_metric: 'Shares (42/1k)' },
    { post_id: 'POST-134', hook: 'My teenager said this and I was speechless', brand: 'teenagers', weighted_score: 88.1, top_metric: 'Comments (156)' },
  ],
  losers: [
    { post_id: 'POST-098', hook: 'Generic parenting tip #47', brand: 'newborns', weighted_score: 23.1, issue: 'Low completion rate (18%)' },
    { post_id: 'POST-101', hook: 'What I feed my toddler in a day', brand: 'toddlers', weighted_score: 31.4, issue: 'High skip rate at 3s mark' },
  ],
  recommendations: {
    double_down: ['Raw honesty hooks for newborns', 'Problem-solution format for toddlers', 'Debate-style for teenagers'],
    adjust: ['Reduce talking head length past 20s', 'Add captions to first 3 seconds', 'Test warmer color grading'],
    emerging: ['Parent-teen duet format', 'Day-in-the-life montage', 'Expert quote overlays']
  },
  weekly_summary: '## Weekly Performance Summary\n\nOverall engagement is up **12%** week-over-week. Newborns brand leads in saves and quiz CTR. Toddlers brand saw a 23% increase in shares after switching to demonstration format.\n\n### Key Wins\n- Raw honesty content outperforms polished content by **3.2x** in saves\n- Quiz CTR improved from 3.1% to 4.8% after CTA placement optimization\n- RPM increased to $12.50, up from $9.80 last week\n\n### Areas for Improvement\n- Teenager brand completion rate needs work (currently 54% vs target 65%)\n- Facebook engagement lagging behind other platforms by 40%',
  next_week_briefs: [
    'Test whispered voiceover format for newborn late-night content',
    'Create 3-part series on toddler independence milestones',
    'Launch teen Q&A reaction series based on comment themes',
    'A/B test vertical vs square format for Facebook',
  ]
}

const SAMPLE_FUNNEL_DATA = {
  funnel_analysis: {
    newborns: { quiz_ctr: 5.2, completion_rate: 72, optin_rate: 34, conversion_rate: 8.1, weakest_point: 'Opt-in page load speed (3.2s avg)' },
    toddlers: { quiz_ctr: 4.1, completion_rate: 68, optin_rate: 28, conversion_rate: 6.3, weakest_point: 'Quiz question 4 drop-off (38%)' },
    teenagers: { quiz_ctr: 3.8, completion_rate: 58, optin_rate: 22, conversion_rate: 4.7, weakest_point: 'CTA visibility on mobile (below fold)' },
  },
  ab_tests: [
    { test_id: 'AB-001', brand: 'newborns', funnel_stage: 'Opt-in Page', control_description: 'Standard form with email field', variant_description: 'Single-click email button with social proof', expected_impact: '+15% opt-in rate', sample_size: 2000, duration_days: 14 },
    { test_id: 'AB-002', brand: 'toddlers', funnel_stage: 'Quiz Question 4', control_description: 'Multiple choice with 5 options', variant_description: 'Image-based 3-option selection', expected_impact: '+22% completion rate', sample_size: 1500, duration_days: 10 },
    { test_id: 'AB-003', brand: 'teenagers', funnel_stage: 'CTA Placement', control_description: 'CTA at video end (25s mark)', variant_description: 'Floating CTA at 8s with reminder at end', expected_impact: '+30% quiz CTR', sample_size: 3000, duration_days: 14 },
    { test_id: 'AB-004', brand: 'newborns', funnel_stage: 'Quiz Results Page', control_description: 'Text-only results with score', variant_description: 'Visual results card with personalized badge', expected_impact: '+18% share rate', sample_size: 1800, duration_days: 12 },
  ],
  optimization_summary: '## Funnel Optimization Summary\n\nThe overall funnel health is **moderate** with newborns leading in conversion efficiency. Key bottlenecks identified across all brands are centered on the opt-in stage and quiz engagement.\n\n### Priority Actions\n1. **Newborns**: Optimize page load speed - current 3.2s is losing 15% of traffic\n2. **Toddlers**: Simplify quiz question 4 - current 38% drop-off is the biggest leak\n3. **Teenagers**: Move CTA above fold on mobile - 60% of teen traffic is mobile\n\n### Expected ROI\nImplementing all proposed A/B tests could yield an estimated **+24% overall conversion rate** within 30 days.'
}

// ─── NAV CONFIG ──────────────────────────────────────────────────
const NAV_ITEMS: { key: SectionKey; label: string; iconName: string; agentKey: AgentKey }[] = [
  { key: 'command', label: 'Command Center', iconName: 'home', agentKey: 'trendScout' },
  { key: 'hooks', label: 'Hook Bank', iconName: 'bookmark', agentKey: 'hookLab' },
  { key: 'scripts', label: 'Script Queue', iconName: 'edit', agentKey: 'scriptEngine' },
  { key: 'render', label: 'Render Pipeline', iconName: 'video', agentKey: 'production' },
  { key: 'distribution', label: 'Distribution', iconName: 'calendar', agentKey: 'distribution' },
  { key: 'analytics', label: 'Analytics', iconName: 'chart', agentKey: 'analytics' },
  { key: 'funnel', label: 'Funnel Lab', iconName: 'target', agentKey: 'funnelOptimizer' },
]

function NavIcon({ name, size }: { name: string; size: number }) {
  switch (name) {
    case 'home': return <FiHome size={size} />
    case 'bookmark': return <FiBookmark size={size} />
    case 'edit': return <FiEdit3 size={size} />
    case 'video': return <FiVideo size={size} />
    case 'calendar': return <FiCalendar size={size} />
    case 'chart': return <FiBarChart2 size={size} />
    case 'target': return <FiTarget size={size} />
    default: return <FiActivity size={size} />
  }
}

const BRAND_COLORS: Record<string, string> = {
  newborns: 'bg-blue-100 text-blue-800 border-blue-200',
  toddlers: 'bg-green-100 text-green-800 border-green-200',
  teenagers: 'bg-purple-100 text-purple-800 border-purple-200',
}

const BRAND_DOT_COLORS: Record<string, string> = {
  newborns: 'bg-blue-500',
  toddlers: 'bg-green-500',
  teenagers: 'bg-purple-500',
}

const RISK_COLORS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-red-100 text-red-800',
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  rendering: 'bg-blue-100 text-blue-800',
  queued: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
  scheduled: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  draft: 'bg-gray-100 text-gray-600',
}

// ─── HELPERS ─────────────────────────────────────────────────────
function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1 font-serif tracking-wide">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1 font-serif tracking-wide">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2 font-serif tracking-wide">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm leading-relaxed">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm leading-relaxed">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm leading-relaxed">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part)
}

function formatTime(iso: string | null) {
  if (!iso) return 'Never'
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch { return 'Unknown' }
}

function formatDateTime(iso: string) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

// ─── ERROR BOUNDARY ──────────────────────────────────────────────
class InlineErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2 font-serif">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Try again</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── SMALL COMPONENTS ────────────────────────────────────────────
function StatusMessage({ message, type }: { message: string; type: 'success' | 'error' | 'info' }) {
  if (!message) return null
  const colors = type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800'
  return (
    <div className={`px-4 py-2 rounded-md border text-sm ${colors} flex items-center gap-2`}>
      {type === 'error' ? <FiAlertTriangle size={14} /> : type === 'success' ? <FiCheck size={14} /> : <FiActivity size={14} />}
      <span>{message}</span>
    </div>
  )
}

function KpiCard({ label, value, unit, trend }: { label: string; value: number | string; unit?: string; trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <Card className="bg-card border-border/30 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans mb-1">{label}</p>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-bold font-serif tracking-tight">{value}</span>
          {unit && <span className="text-sm text-muted-foreground mb-0.5">{unit}</span>}
          {trend && (
            <span className={`ml-auto ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>
              {trend === 'up' ? <FiTrendingUp size={16} /> : trend === 'down' ? <FiChevronDown size={16} /> : <FiActivity size={16} />}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function PipelineStageBadge({ label, count, active, icon }: { label: string; count: number; active: boolean; icon: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${active ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-card border-border/30 text-foreground'}`}>
      {icon}
      <span className="text-xs font-medium whitespace-nowrap">{label}</span>
      <Badge variant={active ? 'secondary' : 'outline'} className="text-[10px] px-1.5 py-0">{count}</Badge>
    </div>
  )
}

function BrandBadge({ brand }: { brand: string }) {
  const lower = (brand ?? '').toLowerCase()
  const cls = BRAND_COLORS[lower] ?? 'bg-gray-100 text-gray-700 border-gray-200'
  return <Badge className={`${cls} text-[10px] capitalize border`}>{brand}</Badge>
}

function RiskBadge({ risk }: { risk: string }) {
  const upper = (risk ?? '').toUpperCase()
  const cls = RISK_COLORS[upper] ?? 'bg-gray-100 text-gray-600'
  return <Badge className={`${cls} text-[10px]`}>{upper}</Badge>
}

function StatusBadgeCmp({ status }: { status: string }) {
  const lower = (status ?? '').toLowerCase()
  const cls = STATUS_COLORS[lower] ?? 'bg-gray-100 text-gray-600'
  return <Badge className={`${cls} text-[10px] capitalize`}>{status}</Badge>
}

// ─── MAIN PAGE ───────────────────────────────────────────────────
export default function Page() {
  const [activeSection, setActiveSection] = useState<SectionKey>('command')
  const [activeBrand, setActiveBrand] = useState<BrandKey>('all')
  const [showSampleData, setShowSampleData] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const defaultAgentState: AgentState = { loading: false, data: null, error: null, lastRun: null }
  const [agentStates, setAgentStates] = useState<Record<AgentKey, AgentState>>({
    trendScout: { ...defaultAgentState },
    hookLab: { ...defaultAgentState },
    scriptEngine: { ...defaultAgentState },
    production: { ...defaultAgentState },
    distribution: { ...defaultAgentState },
    analytics: { ...defaultAgentState },
    funnelOptimizer: { ...defaultAgentState },
  })

  const [hookApprovals, setHookApprovals] = useState<Record<string, 'approved' | 'rejected' | 'pending'>>({})
  const [expandedScripts, setExpandedScripts] = useState<Record<string, boolean>>({})
  const [hookRiskFilter, setHookRiskFilter] = useState<string>('all')
  const [hookStatusFilter, setHookStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (statusMsg) {
      const t = setTimeout(() => setStatusMsg(null), 5000)
      return () => clearTimeout(t)
    }
  }, [statusMsg])

  // ─── AGENT RUNNER ───────────────────────────────────────────────
  const runAgent = useCallback(async (agentKey: AgentKey, message: string) => {
    setAgentStates(prev => ({ ...prev, [agentKey]: { ...prev[agentKey], loading: true, error: null } }))
    setActiveAgentId(AGENT_IDS[agentKey])
    setStatusMsg({ message: `Running ${agentKey}...`, type: 'info' })

    const result = await callAIAgent(message, AGENT_IDS[agentKey])

    if (result.success) {
      const data = result?.response?.result ?? {}
      setAgentStates(prev => ({ ...prev, [agentKey]: { loading: false, data, error: null, lastRun: new Date().toISOString() } }))
      setStatusMsg({ message: `${agentKey} completed successfully`, type: 'success' })
    } else {
      setAgentStates(prev => ({ ...prev, [agentKey]: { ...prev[agentKey], loading: false, error: result.error || 'Agent call failed' } }))
      setStatusMsg({ message: result.error || 'Agent call failed', type: 'error' })
    }
    setActiveAgentId(null)
  }, [])

  const handleRunTrendScout = useCallback(() => {
    const brandMsg = activeBrand === 'all' ? 'all brands (Newborns, Toddlers, Teenagers)' : activeBrand
    runAgent('trendScout', `Research trending parenting content for ${brandMsg} niche. Find viral hooks, content angles, and emotional triggers from competitor accounts on Instagram, TikTok, YouTube Shorts, and Facebook Reels.`)
  }, [activeBrand, runAgent])

  const handleRunHookLab = useCallback(() => {
    const td = getAgentData('trendScout')
    runAgent('hookLab', `Based on these inspiration briefs: ${JSON.stringify(td?.inspiration_briefs ?? [])}. Generate 50 hooks per brand. Apply weighted scoring. Flag compliance risks.`)
  }, [runAgent])

  const handleRunScriptEngine = useCallback(() => {
    const hd = getAgentData('hookLab')
    const all = getAllHooks(hd)
    const approved = all.filter((_, i) => hookApprovals[`hook-${i}`] === 'approved')
    const hooksToUse = approved.length > 0 ? approved : all.slice(0, 10)
    runAgent('scriptEngine', `Transform these approved hooks into video scripts: ${JSON.stringify(hooksToUse)}. Create 20-35s scripts with platform-specific captions for Instagram, TikTok, YouTube Shorts, and Facebook.`)
  }, [runAgent, hookApprovals])

  const handleRunProduction = useCallback(() => {
    const sd = getAgentData('scriptEngine')
    runAgent('production', `Generate render job specifications for these scripts: ${JSON.stringify(sd?.scripts ?? [])}. Include voiceover instructions, subtitle styling, brand templates.`)
  }, [runAgent])

  const handleRunDistribution = useCallback(() => {
    const pd = getAgentData('production')
    runAgent('distribution', `Create posting schedule for these rendered videos: ${JSON.stringify(pd?.render_jobs ?? [])}. Follow brand posting cadence rules. Distribute across TikTok, Instagram, YouTube Shorts, and Facebook.`)
  }, [runAgent])

  const handleRunAnalytics = useCallback(() => {
    runAgent('analytics', 'Analyze performance data for all brands (Newborns, Toddlers, Teenagers). Calculate KPIs including saves/1k, shares/1k, follows/1k, completion rate, quiz CTR, RPM. Identify winners and losers. Generate weekly recommendations.')
  }, [runAgent])

  const handleRunFunnelOptimizer = useCallback(() => {
    runAgent('funnelOptimizer', 'Analyze quiz funnel performance for all brands (Newborns, Toddlers, Teenagers). Identify weak points in each funnel stage. Generate 2 A/B test plans per brand with expected impact estimates.')
  }, [runAgent])

  // ─── DATA ACCESSORS ─────────────────────────────────────────────
  function getAgentData(key: AgentKey) {
    if (showSampleData && !agentStates[key].data) {
      const sampleMap: Record<AgentKey, any> = {
        trendScout: SAMPLE_TREND_DATA,
        hookLab: SAMPLE_HOOKS_DATA,
        scriptEngine: SAMPLE_SCRIPTS_DATA,
        production: SAMPLE_PRODUCTION_DATA,
        distribution: SAMPLE_DISTRIBUTION_DATA,
        analytics: SAMPLE_ANALYTICS_DATA,
        funnelOptimizer: SAMPLE_FUNNEL_DATA,
      }
      return sampleMap[key] ?? null
    }
    return agentStates[key].data
  }

  function getAllHooks(hookData: any): HookItem[] {
    if (!hookData?.hooks_by_brand) return []
    const brands = ['newborns', 'toddlers', 'teenagers']
    const all: HookItem[] = []
    for (const b of brands) {
      if (activeBrand !== 'all' && b !== activeBrand) continue
      const items = hookData.hooks_by_brand[b]
      if (Array.isArray(items)) all.push(...items)
    }
    return all
  }

  function filterByBrand<T extends Record<string, any>>(items: T[]): T[] {
    if (!Array.isArray(items)) return []
    if (activeBrand === 'all') return items
    return items.filter(item => {
      const b = (item?.brand ?? item?.target_niche ?? '').toLowerCase()
      return b === activeBrand
    })
  }

  // Data references
  const trendData = getAgentData('trendScout')
  const hookData = getAgentData('hookLab')
  const scriptData = getAgentData('scriptEngine')
  const prodData = getAgentData('production')
  const distData = getAgentData('distribution')
  const analyticsData = getAgentData('analytics')
  const funnelData = getAgentData('funnelOptimizer')

  const pipelineCounts = {
    trends: Array.isArray(trendData?.inspiration_briefs) ? trendData.inspiration_briefs.length : 0,
    hooks: hookData?.generation_stats?.total_hooks ?? 0,
    scripts: scriptData?.total_scripts ?? 0,
    renders: prodData?.batch_summary?.total_jobs ?? 0,
    posts: distData?.distribution_summary?.total_posts ?? 0,
    analytics: analyticsData ? 1 : 0,
    funnels: funnelData ? 1 : 0,
  }

  const agentRunners: Record<AgentKey, () => void> = {
    trendScout: handleRunTrendScout,
    hookLab: handleRunHookLab,
    scriptEngine: handleRunScriptEngine,
    production: handleRunProduction,
    distribution: handleRunDistribution,
    analytics: handleRunAnalytics,
    funnelOptimizer: handleRunFunnelOptimizer,
  }

  const agentLabels: Record<AgentKey, string> = {
    trendScout: 'Run Trend Scout',
    hookLab: 'Generate Hooks',
    scriptEngine: 'Generate Scripts',
    production: 'Render Batch',
    distribution: 'Queue Distribution',
    analytics: 'Run Analytics',
    funnelOptimizer: 'Optimize Funnels',
  }

  function AgentIcon({ agentKey, size }: { agentKey: AgentKey; size: number }) {
    switch (agentKey) {
      case 'trendScout': return <FiSearch size={size} />
      case 'hookLab': return <FiZap size={size} />
      case 'scriptEngine': return <FiFileText size={size} />
      case 'production': return <FiVideo size={size} />
      case 'distribution': return <FiSend size={size} />
      case 'analytics': return <FiBarChart2 size={size} />
      case 'funnelOptimizer': return <FiTarget size={size} />
      default: return <FiActivity size={size} />
    }
  }

  const sectionTitles: Record<SectionKey, string> = {
    command: 'Command Center',
    hooks: 'Hook Bank',
    scripts: 'Script Queue',
    render: 'Render Pipeline',
    distribution: 'Distribution Calendar',
    analytics: 'Analytics Dashboard',
    funnel: 'Funnel Lab',
  }

  // ─── SCREEN RENDERERS ──────────────────────────────────────────

  function renderCommandCenter() {
    const briefs: InspirationBrief[] = Array.isArray(trendData?.inspiration_briefs) ? filterByBrand(trendData.inspiration_briefs.map((b: any) => ({ ...b, brand: b?.target_niche }))) : []
    const highRiskHooks = hookData?.generation_stats?.high_risk_count ?? 0

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <PipelineStageBadge label="Trends" count={pipelineCounts.trends} active={true} icon={<FiSearch size={14} />} />
          <FiChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
          <PipelineStageBadge label="Hooks" count={pipelineCounts.hooks} active={false} icon={<FiZap size={14} />} />
          <FiChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
          <PipelineStageBadge label="Scripts" count={pipelineCounts.scripts} active={false} icon={<FiFileText size={14} />} />
          <FiChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
          <PipelineStageBadge label="Renders" count={pipelineCounts.renders} active={false} icon={<FiVideo size={14} />} />
          <FiChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
          <PipelineStageBadge label="Posts" count={pipelineCounts.posts} active={false} icon={<FiSend size={14} />} />
          <FiChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
          <PipelineStageBadge label="Analytics" count={pipelineCounts.analytics} active={false} icon={<FiBarChart2 size={14} />} />
          <FiChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
          <PipelineStageBadge label="Funnels" count={pipelineCounts.funnels} active={false} icon={<FiTarget size={14} />} />
        </div>

        {highRiskHooks > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            <FiAlertTriangle size={16} />
            <span className="font-medium">{highRiskHooks} high-risk hooks flagged</span>
            <span className="text-red-600">- Review in Hook Bank before publishing</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['newborns', 'toddlers', 'teenagers'] as const).map(brand => {
            const hooksCount = Array.isArray(hookData?.hooks_by_brand?.[brand]) ? hookData.hooks_by_brand[brand].length : 0
            const scriptsCount = Array.isArray(scriptData?.scripts) ? scriptData.scripts.filter((s: any) => (s?.brand ?? '').toLowerCase() === brand).length : 0
            const postsCount = distData?.distribution_summary?.by_brand?.[brand] ?? 0
            const fBrand = funnelData?.funnel_analysis?.[brand]

            return (
              <Card key={brand} className="bg-card border-border/30 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${BRAND_DOT_COLORS[brand]}`} />
                    <CardTitle className="text-base font-serif tracking-wide capitalize">{brand}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold font-serif">{hooksCount}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Hooks</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold font-serif">{scriptsCount}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Scripts</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold font-serif">{postsCount}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Posts</p>
                    </div>
                  </div>
                  {fBrand && (
                    <div className="pt-2 border-t border-border/20">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Quiz CTR</span>
                        <span className="font-medium">{fBrand.quiz_ctr ?? 0}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Conversion</span>
                        <span className="font-medium">{fBrand.conversion_rate ?? 0}%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="bg-card border-border/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif tracking-wide">Agent Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {(Object.keys(AGENT_IDS) as AgentKey[]).map(key => {
                const state = agentStates[key]
                return (
                  <Button key={key} variant={state.loading ? 'secondary' : 'outline'} size="sm" className="flex flex-col items-center gap-1 h-auto py-3 text-xs" onClick={agentRunners[key]} disabled={state.loading}>
                    {state.loading ? <FiLoader size={14} className="animate-spin" /> : <AgentIcon agentKey={key} size={14} />}
                    <span className="leading-tight text-center">{agentLabels[key]}</span>
                    <span className={`text-[9px] ${state.loading ? 'text-blue-600' : state.error ? 'text-red-500' : state.lastRun ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {state.loading ? 'Running...' : state.error ? 'Error' : state.lastRun ? formatTime(state.lastRun) : 'Idle'}
                    </span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {briefs.length > 0 && (
          <Card className="bg-card border-border/30 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-serif tracking-wide">Latest Inspiration Briefs</CardTitle>
                {trendData?.research_date && <span className="text-xs text-muted-foreground">{trendData.research_date}</span>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {briefs.slice(0, 6).map((brief, i) => (
                  <div key={i} className="p-3 bg-secondary/40 rounded-lg border border-border/20 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm font-serif">{brief?.trend_title ?? ''}</h4>
                      <Badge variant="outline" className="text-[10px] flex-shrink-0">{brief?.brand_fit_score ?? 0}</Badge>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge className="bg-muted text-muted-foreground text-[10px]">{brief?.source_platform ?? ''}</Badge>
                      <BrandBadge brand={brief?.target_niche ?? ''} />
                    </div>
                    <p className="text-xs text-muted-foreground"><span className="font-medium">Hook:</span> {brief?.hook_pattern ?? ''}</p>
                    <p className="text-xs text-muted-foreground"><span className="font-medium">Trigger:</span> {brief?.emotional_trigger ?? ''}</p>
                    <p className="text-xs text-muted-foreground"><span className="font-medium">Angle:</span> {brief?.content_angle ?? ''}</p>
                    {brief?.compliance_notes && <p className="text-[10px] text-amber-700"><FiAlertTriangle className="inline mr-1" size={10} />{brief.compliance_notes}</p>}
                    {brief?.suggested_adaptation && <p className="text-xs text-primary/80 italic">{brief.suggested_adaptation}</p>}
                  </div>
                ))}
              </div>
              {trendData?.summary && (
                <div className="mt-4 p-3 bg-secondary/20 rounded-lg border border-border/10">
                  <h4 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Summary</h4>
                  {renderMarkdown(trendData.summary)}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!briefs.length && !agentStates.trendScout.loading && (
          <Card className="bg-card border-border/30 shadow-sm">
            <CardContent className="py-12 text-center">
              <FiSearch size={32} className="mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground font-serif text-lg mb-1">No trends loaded yet</p>
              <p className="text-sm text-muted-foreground mb-4">Run the Trend Scout agent to discover viral content opportunities</p>
              <Button onClick={handleRunTrendScout} disabled={agentStates.trendScout.loading} size="sm">
                <FiSearch className="mr-2" size={14} /> Run Trend Scout
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  function renderHookBank() {
    const allHooks = getAllHooks(hookData)
    const stats = hookData?.generation_stats

    let filteredHooks = [...allHooks]
    if (hookRiskFilter !== 'all') {
      filteredHooks = filteredHooks.filter(h => (h?.compliance_risk ?? '').toUpperCase() === hookRiskFilter.toUpperCase())
    }
    if (hookStatusFilter !== 'all') {
      filteredHooks = filteredHooks.filter((_, i) => (hookApprovals[`hook-${i}`] ?? 'pending') === hookStatusFilter)
    }

    return (
      <div className="space-y-4">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Total Hooks" value={stats?.total_hooks ?? 0} />
            <KpiCard label="Low Risk" value={stats?.low_risk_count ?? 0} trend="up" />
            <KpiCard label="Medium Risk" value={stats?.medium_risk_count ?? 0} trend="neutral" />
            <KpiCard label="High Risk" value={stats?.high_risk_count ?? 0} trend="down" />
          </div>
        )}

        <Card className="bg-card border-border/30 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <FiFilter size={14} className="text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Filters:</span>
              </div>
              <Select value={hookRiskFilter} onValueChange={setHookRiskFilter}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Risk Level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risks</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
              <Select value={hookStatusFilter} onValueChange={setHookStatusFilter}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground ml-auto">{filteredHooks.length} hooks</span>
            </div>
          </CardContent>
        </Card>

        {filteredHooks.length > 0 ? (
          <Card className="bg-card border-border/30 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="min-w-[700px]">
                  <div className="grid grid-cols-[1fr_80px_80px_70px_70px_70px_80px] gap-2 px-4 py-2 bg-secondary/40 border-b border-border/20 text-[10px] uppercase tracking-widest font-medium text-muted-foreground sticky top-0 z-10">
                    <span>Hook Text</span>
                    <span>Pillar</span>
                    <span>Format</span>
                    <span>CTA</span>
                    <span>Intent</span>
                    <span>Risk</span>
                    <span>Actions</span>
                  </div>
                  {filteredHooks.map((hook, i) => {
                    const key = `hook-${i}`
                    const status = hookApprovals[key] ?? 'pending'
                    return (
                      <div key={i} className={`grid grid-cols-[1fr_80px_80px_70px_70px_70px_80px] gap-2 px-4 py-3 border-b border-border/10 items-center text-sm hover:bg-secondary/20 transition-colors ${status === 'rejected' ? 'opacity-50' : ''}`}>
                        <span className="text-xs leading-relaxed line-clamp-2">{hook?.hook_text ?? ''}</span>
                        <Badge variant="outline" className="text-[10px] w-fit">{hook?.pillar ?? ''}</Badge>
                        <span className="text-[10px] text-muted-foreground">{hook?.format ?? ''}</span>
                        <span className="text-[10px] text-muted-foreground">{hook?.cta_type ?? ''}</span>
                        <span className="text-[10px] text-muted-foreground">{hook?.predicted_intent ?? ''}</span>
                        <RiskBadge risk={hook?.compliance_risk ?? ''} />
                        <div className="flex items-center gap-1">
                          <button className={`p-1 rounded ${status === 'approved' ? 'bg-green-100 text-green-700' : 'hover:bg-green-50 text-muted-foreground'}`} onClick={() => setHookApprovals(prev => ({ ...prev, [key]: status === 'approved' ? 'pending' : 'approved' }))} title="Approve">
                            <FiCheck size={12} />
                          </button>
                          <button className={`p-1 rounded ${status === 'rejected' ? 'bg-red-100 text-red-700' : 'hover:bg-red-50 text-muted-foreground'}`} onClick={() => setHookApprovals(prev => ({ ...prev, [key]: status === 'rejected' ? 'pending' : 'rejected' }))} title="Reject">
                            <FiX size={12} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border/30 shadow-sm">
            <CardContent className="py-12 text-center">
              <FiZap size={32} className="mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground font-serif text-lg mb-1">Hook Bank is empty</p>
              <p className="text-sm text-muted-foreground mb-4">Generate hooks from your trend research</p>
              <Button onClick={handleRunHookLab} disabled={agentStates.hookLab.loading} size="sm">
                {agentStates.hookLab.loading ? <FiLoader className="mr-2 animate-spin" size={14} /> : <FiZap className="mr-2" size={14} />}
                Generate Hooks
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  function renderScriptQueue() {
    const scripts: ScriptItem[] = Array.isArray(scriptData?.scripts) ? filterByBrand(scriptData.scripts) : []
    const breakdown = scriptData?.brand_breakdown

    return (
      <div className="space-y-4">
        {breakdown && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Total Scripts" value={scriptData?.total_scripts ?? 0} />
            <KpiCard label="Newborns" value={breakdown?.newborns ?? 0} />
            <KpiCard label="Toddlers" value={breakdown?.toddlers ?? 0} />
            <KpiCard label="Teenagers" value={breakdown?.teenagers ?? 0} />
          </div>
        )}

        {scripts.length > 0 ? (
          <div className="space-y-3">
            {scripts.map((script, i) => {
              const sid = script?.script_id ?? `s-${i}`
              const isExpanded = expandedScripts[sid] ?? false
              return (
                <Card key={sid} className="bg-card border-border/30 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">{script?.script_id ?? ''}</span>
                          <BrandBadge brand={script?.brand ?? ''} />
                          <StatusBadgeCmp status={script?.compliance_status ?? 'Draft'} />
                          <Badge variant="outline" className="text-[10px]">{script?.duration_estimate ?? ''}</Badge>
                          <Badge variant="outline" className="text-[10px]">{script?.cta_type ?? ''}</Badge>
                        </div>
                        <p className="text-sm font-medium font-serif leading-relaxed">{script?.hook_text ?? ''}</p>
                        {script?.core_insight && <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">Insight:</span> {script.core_insight}</p>}
                      </div>
                      <button onClick={() => setExpandedScripts(prev => ({ ...prev, [sid]: !isExpanded }))} className="p-1.5 hover:bg-secondary/40 rounded transition-colors flex-shrink-0">
                        {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-4 border-t border-border/20 pt-4">
                        <div>
                          <h5 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Full Script</h5>
                          <div className="bg-secondary/20 p-3 rounded-lg text-sm leading-relaxed">
                            {renderMarkdown(script?.full_script ?? '')}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-secondary/10 p-3 rounded-lg">
                            <h6 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Hook Section</h6>
                            <p className="text-sm">{script?.hook_section ?? ''}</p>
                          </div>
                          <div className="bg-secondary/10 p-3 rounded-lg">
                            <h6 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Say This Instead</h6>
                            <p className="text-sm">{script?.say_this_instead ?? ''}</p>
                          </div>
                        </div>

                        <div className="bg-primary/5 p-3 rounded-lg">
                          <h6 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Call to Action</h6>
                          <p className="text-sm font-medium">{script?.cta_text ?? ''}</p>
                        </div>

                        {script?.captions && (
                          <div>
                            <h5 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Platform Captions</h5>
                            <Tabs defaultValue="instagram" className="w-full">
                              <TabsList className="mb-2">
                                <TabsTrigger value="instagram" className="text-xs">Instagram</TabsTrigger>
                                <TabsTrigger value="tiktok" className="text-xs">TikTok</TabsTrigger>
                                <TabsTrigger value="youtube" className="text-xs">YouTube</TabsTrigger>
                                <TabsTrigger value="facebook" className="text-xs">Facebook</TabsTrigger>
                              </TabsList>
                              <TabsContent value="instagram" className="bg-secondary/10 p-3 rounded-lg text-sm">{script.captions?.instagram ?? ''}</TabsContent>
                              <TabsContent value="tiktok" className="bg-secondary/10 p-3 rounded-lg text-sm">{script.captions?.tiktok ?? ''}</TabsContent>
                              <TabsContent value="youtube" className="bg-secondary/10 p-3 rounded-lg text-sm">{script.captions?.youtube_shorts ?? ''}</TabsContent>
                              <TabsContent value="facebook" className="bg-secondary/10 p-3 rounded-lg text-sm">{script.captions?.facebook ?? ''}</TabsContent>
                            </Tabs>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="bg-card border-border/30 shadow-sm">
            <CardContent className="py-12 text-center">
              <FiFileText size={32} className="mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground font-serif text-lg mb-1">No scripts generated</p>
              <p className="text-sm text-muted-foreground mb-4">Approve hooks in the Hook Bank, then generate scripts</p>
              <Button onClick={handleRunScriptEngine} disabled={agentStates.scriptEngine.loading} size="sm">
                {agentStates.scriptEngine.loading ? <FiLoader className="mr-2 animate-spin" size={14} /> : <FiFileText className="mr-2" size={14} />}
                Generate Scripts
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  function renderRenderPipeline() {
    const jobs: RenderJob[] = Array.isArray(prodData?.render_jobs) ? filterByBrand(prodData.render_jobs) : []
    const summary = prodData?.batch_summary

    const queuedJobs = jobs.filter(j => (j?.status ?? '').toLowerCase() === 'queued')
    const renderingJobs = jobs.filter(j => (j?.status ?? '').toLowerCase() === 'rendering')
    const completedJobs = jobs.filter(j => (j?.status ?? '').toLowerCase() === 'completed')
    const failedJobs = jobs.filter(j => (j?.status ?? '').toLowerCase() === 'failed')

    function renderJobCard(job: RenderJob) {
      const isRendering = (job?.status ?? '').toLowerCase() === 'rendering'
      const isFailed = (job?.status ?? '').toLowerCase() === 'failed'
      const isCompleted = (job?.status ?? '').toLowerCase() === 'completed'
      return (
        <div key={job?.job_id ?? ''} className="p-3 bg-secondary/20 rounded-lg border border-border/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground">{job?.job_id ?? ''}</span>
            <StatusBadgeCmp status={job?.status ?? ''} />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <BrandBadge brand={job?.brand ?? ''} />
            <span className="text-[10px] text-muted-foreground">Script: {job?.script_id ?? ''}</span>
          </div>
          {job?.voice_config && (
            <div className="text-[10px] text-muted-foreground flex gap-2 flex-wrap">
              <span>Voice: {job.voice_config?.tone ?? ''}</span>
              <span>Speed: {job.voice_config?.speed ?? ''}</span>
            </div>
          )}
          {job?.render_specs && (
            <div className="text-[10px] text-muted-foreground flex gap-2 flex-wrap">
              <span>{job.render_specs?.resolution ?? ''}</span>
              <span>{job.render_specs?.duration ?? ''}</span>
              <span>{job.render_specs?.subtitle_style ?? ''}</span>
            </div>
          )}
          {isRendering && <Progress value={65} className="h-1.5" />}
          {isFailed && job?.error_message && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              <FiAlertTriangle className="inline mr-1" size={10} />
              {job.error_message}
            </div>
          )}
          {isCompleted && job?.asset_url && (
            <a href={job.asset_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
              <FiExternalLink size={10} /> View Asset
            </a>
          )}
          {isFailed && (
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setStatusMsg({ message: `Retrying ${job?.job_id ?? ''}...`, type: 'info' })}>
              <FiRefreshCw size={10} className="mr-1" /> Retry
            </Button>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Total Jobs" value={summary?.total_jobs ?? 0} />
            <KpiCard label="Completed" value={summary?.completed ?? 0} trend="up" />
            <KpiCard label="Queued" value={summary?.queued ?? 0} trend="neutral" />
            <KpiCard label="Failed" value={summary?.failed ?? 0} trend="down" />
          </div>
        )}

        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Queued', items: queuedJobs, color: 'bg-amber-400' },
              { label: 'Rendering', items: renderingJobs, color: 'bg-blue-500' },
              { label: 'Completed', items: completedJobs, color: 'bg-green-500' },
              { label: 'Failed', items: failedJobs, color: 'bg-red-500' },
            ].map(col => (
              <div key={col.label} className="space-y-2">
                <div className="flex items-center gap-2 px-2 pb-2 border-b border-border/20">
                  <div className={`w-2 h-2 rounded-full ${col.color}`} />
                  <h4 className="text-xs font-medium uppercase tracking-widest">{col.label} ({col.items.length})</h4>
                </div>
                {col.items.map(renderJobCard)}
                {col.items.length === 0 && <p className="text-xs text-muted-foreground text-center py-4 italic">None</p>}
              </div>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border/30 shadow-sm">
            <CardContent className="py-12 text-center">
              <FiVideo size={32} className="mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground font-serif text-lg mb-1">No render jobs</p>
              <p className="text-sm text-muted-foreground mb-4">Generate scripts first, then start the render pipeline</p>
              <Button onClick={handleRunProduction} disabled={agentStates.production.loading} size="sm">
                {agentStates.production.loading ? <FiLoader className="mr-2 animate-spin" size={14} /> : <FiVideo className="mr-2" size={14} />}
                Render Batch
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  function renderDistributionCalendar() {
    const posts: SchedulePost[] = Array.isArray(distData?.schedule) ? filterByBrand(distData.schedule) : []
    const summary = distData?.distribution_summary

    const postsByDate: Record<string, SchedulePost[]> = {}
    posts.forEach(post => {
      const date = post?.scheduled_time ? post.scheduled_time.split('T')[0] : 'Unscheduled'
      if (!postsByDate[date]) postsByDate[date] = []
      postsByDate[date].push(post)
    })
    const sortedDates = Object.keys(postsByDate).sort()

    return (
      <div className="space-y-4">
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiCard label="Total Posts" value={summary?.total_posts ?? 0} />
            <KpiCard label="TikTok" value={summary?.by_platform?.tiktok ?? 0} />
            <KpiCard label="Instagram" value={summary?.by_platform?.instagram ?? 0} />
            <KpiCard label="YouTube" value={summary?.by_platform?.youtube ?? 0} />
            <KpiCard label="Facebook" value={summary?.by_platform?.facebook ?? 0} />
          </div>
        )}

        {summary?.by_brand && (
          <div className="grid grid-cols-3 gap-3">
            {(['newborns', 'toddlers', 'teenagers'] as const).map(brand => (
              <div key={brand} className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border/30">
                <div className={`w-3 h-3 rounded-full ${BRAND_DOT_COLORS[brand]}`} />
                <span className="text-sm capitalize font-serif">{brand}</span>
                <span className="text-sm font-bold ml-auto">{summary.by_brand?.[brand] ?? 0}</span>
              </div>
            ))}
          </div>
        )}

        {posts.length > 0 ? (
          <Card className="bg-card border-border/30 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-serif tracking-wide">Distribution Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {sortedDates.map(date => (
                    <div key={date}>
                      <div className="flex items-center gap-2 mb-2">
                        <FiCalendar size={14} className="text-muted-foreground" />
                        <h4 className="text-sm font-medium font-serif">{date}</h4>
                        <Badge variant="outline" className="text-[10px]">{postsByDate[date]?.length ?? 0} posts</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-5">
                        {(postsByDate[date] ?? []).map((post, i) => (
                          <div key={post?.post_id ?? i} className="p-3 bg-secondary/20 rounded-lg border border-border/10 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <BrandBadge brand={post?.brand ?? ''} />
                                <Badge variant="outline" className="text-[10px]">{post?.platform ?? ''}</Badge>
                              </div>
                              <StatusBadgeCmp status={post?.status ?? ''} />
                            </div>
                            <p className="text-xs text-foreground">{post?.caption ?? ''}</p>
                            {post?.hashtags && <p className="text-[10px] text-primary/70">{post.hashtags}</p>}
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>{formatDateTime(post?.scheduled_time ?? '')}</span>
                              <span>Ref: {post?.video_reference ?? ''}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border/30 shadow-sm">
            <CardContent className="py-12 text-center">
              <FiCalendar size={32} className="mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground font-serif text-lg mb-1">No posts scheduled</p>
              <p className="text-sm text-muted-foreground mb-4">Render videos first, then queue distribution</p>
              <Button onClick={handleRunDistribution} disabled={agentStates.distribution.loading} size="sm">
                {agentStates.distribution.loading ? <FiLoader className="mr-2 animate-spin" size={14} /> : <FiSend className="mr-2" size={14} />}
                Queue Distribution
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  function renderAnalyticsDashboard() {
    const kpis = analyticsData?.kpis
    const winners: Winner[] = Array.isArray(analyticsData?.winners) ? filterByBrand(analyticsData.winners) : []
    const losers: Loser[] = Array.isArray(analyticsData?.losers) ? filterByBrand(analyticsData.losers) : []
    const recs = analyticsData?.recommendations
    const weeklySummary = analyticsData?.weekly_summary ?? ''
    const nextWeek: string[] = Array.isArray(analyticsData?.next_week_briefs) ? analyticsData.next_week_briefs : []

    return (
      <div className="space-y-4">
        {kpis && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard label="Saves / 1k" value={kpis?.saves_per_1k ?? 0} trend="up" />
            <KpiCard label="Shares / 1k" value={kpis?.shares_per_1k ?? 0} trend="up" />
            <KpiCard label="Follows / 1k" value={kpis?.follows_per_1k ?? 0} trend="neutral" />
            <KpiCard label="Completion %" value={`${kpis?.completion_rate ?? 0}%`} trend="up" />
            <KpiCard label="Quiz CTR" value={`${kpis?.quiz_ctr ?? 0}%`} trend="up" />
            <KpiCard label="RPM" value={`$${kpis?.rpm ?? 0}`} trend="up" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-card border-border/30 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-serif tracking-wide flex items-center gap-2">
                <FiTrendingUp size={14} className="text-green-600" /> Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {winners.length > 0 ? (
                <div className="space-y-2">
                  {winners.map((w, i) => (
                    <div key={w?.post_id ?? i} className="flex items-start gap-3 p-2 bg-green-50/50 rounded-lg border border-green-100/50">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs font-bold flex-shrink-0">#{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{w?.hook ?? ''}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <BrandBadge brand={w?.brand ?? ''} />
                          <span className="text-[10px] text-muted-foreground">Score: {w?.weighted_score ?? 0}</span>
                          <span className="text-[10px] text-green-700">{w?.top_metric ?? ''}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No winner data yet</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border/30 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-serif tracking-wide flex items-center gap-2">
                <FiAlertTriangle size={14} className="text-red-500" /> Underperformers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {losers.length > 0 ? (
                <div className="space-y-2">
                  {losers.map((l, i) => (
                    <div key={l?.post_id ?? i} className="flex items-start gap-3 p-2 bg-red-50/50 rounded-lg border border-red-100/50">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-xs font-bold flex-shrink-0"><FiX size={14} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{l?.hook ?? ''}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <BrandBadge brand={l?.brand ?? ''} />
                          <span className="text-[10px] text-muted-foreground">Score: {l?.weighted_score ?? 0}</span>
                          <span className="text-[10px] text-red-600">{l?.issue ?? ''}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No underperformer data yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {recs && (
          <Card className="bg-card border-border/30 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-serif tracking-wide">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h5 className="text-xs font-medium uppercase tracking-widest text-green-700 flex items-center gap-1"><FiCheck size={12} /> Double Down</h5>
                  {Array.isArray(recs?.double_down) && recs.double_down.map((item: string, i: number) => (
                    <div key={i} className="text-sm p-2 bg-green-50/50 rounded border border-green-100/40">{item}</div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs font-medium uppercase tracking-widest text-amber-700 flex items-center gap-1"><FiRefreshCw size={12} /> Adjust</h5>
                  {Array.isArray(recs?.adjust) && recs.adjust.map((item: string, i: number) => (
                    <div key={i} className="text-sm p-2 bg-amber-50/50 rounded border border-amber-100/40">{item}</div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs font-medium uppercase tracking-widest text-blue-700 flex items-center gap-1"><FiTrendingUp size={12} /> Emerging</h5>
                  {Array.isArray(recs?.emerging) && recs.emerging.map((item: string, i: number) => (
                    <div key={i} className="text-sm p-2 bg-blue-50/50 rounded border border-blue-100/40">{item}</div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {weeklySummary && (
          <Card className="bg-card border-border/30 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-serif tracking-wide">Weekly Report</CardTitle>
            </CardHeader>
            <CardContent>{renderMarkdown(weeklySummary)}</CardContent>
          </Card>
        )}

        {nextWeek.length > 0 && (
          <Card className="bg-card border-border/30 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-serif tracking-wide">Next Week Briefs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {nextWeek.map((brief, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-secondary/20 rounded-lg border border-border/10">
                    <Badge variant="outline" className="text-[10px] flex-shrink-0 mt-0.5">{i + 1}</Badge>
                    <p className="text-sm">{brief}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!kpis && !agentStates.analytics.loading && (
          <Card className="bg-card border-border/30 shadow-sm">
            <CardContent className="py-12 text-center">
              <FiBarChart2 size={32} className="mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground font-serif text-lg mb-1">No analytics data</p>
              <p className="text-sm text-muted-foreground mb-4">Run the analytics agent to generate performance insights</p>
              <Button onClick={handleRunAnalytics} disabled={agentStates.analytics.loading} size="sm">
                {agentStates.analytics.loading ? <FiLoader className="mr-2 animate-spin" size={14} /> : <FiBarChart2 className="mr-2" size={14} />}
                Run Analytics
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  function renderFunnelLab() {
    const funnel = funnelData?.funnel_analysis
    const abTests: ABTest[] = Array.isArray(funnelData?.ab_tests) ? filterByBrand(funnelData.ab_tests) : []
    const optSummary = funnelData?.optimization_summary ?? ''

    const allBrands = ['newborns', 'toddlers', 'teenagers'] as const
    const filteredBrands = activeBrand === 'all' ? allBrands : allBrands.filter(b => b === activeBrand)

    return (
      <div className="space-y-4">
        {funnel && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredBrands.map(brand => {
              const data: FunnelBrand | undefined = funnel?.[brand]
              if (!data) return null
              return (
                <Card key={brand} className="bg-card border-border/30 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${BRAND_DOT_COLORS[brand]}`} />
                      <CardTitle className="text-base font-serif tracking-wide capitalize">{brand}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: 'Quiz CTR', val: data?.quiz_ctr ?? 0, pct: (data?.quiz_ctr ?? 0) * 10 },
                      { label: 'Completion Rate', val: data?.completion_rate ?? 0, pct: data?.completion_rate ?? 0 },
                      { label: 'Opt-in Rate', val: data?.optin_rate ?? 0, pct: data?.optin_rate ?? 0 },
                      { label: 'Conversion Rate', val: data?.conversion_rate ?? 0, pct: (data?.conversion_rate ?? 0) * 5 },
                    ].map(metric => (
                      <div key={metric.label} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{metric.label}</span>
                          <span className="text-sm font-medium">{metric.val}%</span>
                        </div>
                        <Progress value={Math.min(metric.pct, 100)} className="h-1.5" />
                      </div>
                    ))}
                    {data?.weakest_point && (
                      <div className="mt-2 p-2 bg-red-50/50 rounded border border-red-100/40">
                        <div className="flex items-start gap-1.5">
                          <FiAlertTriangle size={12} className="text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-red-600 font-medium">Weakest Point</p>
                            <p className="text-xs text-red-700">{data.weakest_point}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {abTests.length > 0 && (
          <Card className="bg-card border-border/30 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-serif tracking-wide">A/B Test Proposals</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[350px]">
                <div className="min-w-[700px]">
                  <div className="grid grid-cols-[60px_70px_90px_1fr_1fr_90px_70px_55px] gap-2 px-4 py-2 bg-secondary/40 border-b border-border/20 text-[10px] uppercase tracking-widest font-medium text-muted-foreground sticky top-0 z-10">
                    <span>Test ID</span>
                    <span>Brand</span>
                    <span>Stage</span>
                    <span>Control</span>
                    <span>Variant</span>
                    <span>Impact</span>
                    <span>Sample</span>
                    <span>Days</span>
                  </div>
                  {abTests.map((test, i) => (
                    <div key={test?.test_id ?? i} className="grid grid-cols-[60px_70px_90px_1fr_1fr_90px_70px_55px] gap-2 px-4 py-3 border-b border-border/10 items-start text-xs hover:bg-secondary/20 transition-colors">
                      <span className="font-mono text-muted-foreground">{test?.test_id ?? ''}</span>
                      <BrandBadge brand={test?.brand ?? ''} />
                      <Badge variant="outline" className="text-[10px] w-fit">{test?.funnel_stage ?? ''}</Badge>
                      <span className="text-muted-foreground">{test?.control_description ?? ''}</span>
                      <span className="font-medium">{test?.variant_description ?? ''}</span>
                      <Badge className="bg-green-100 text-green-800 text-[10px]">{test?.expected_impact ?? ''}</Badge>
                      <span className="text-muted-foreground">{(test?.sample_size ?? 0).toLocaleString()}</span>
                      <span className="text-muted-foreground">{test?.duration_days ?? 0}d</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {optSummary && (
          <Card className="bg-card border-border/30 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-serif tracking-wide">Optimization Summary</CardTitle>
            </CardHeader>
            <CardContent>{renderMarkdown(optSummary)}</CardContent>
          </Card>
        )}

        {!funnel && !agentStates.funnelOptimizer.loading && (
          <Card className="bg-card border-border/30 shadow-sm">
            <CardContent className="py-12 text-center">
              <FiTarget size={32} className="mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground font-serif text-lg mb-1">No funnel data</p>
              <p className="text-sm text-muted-foreground mb-4">Run the funnel optimizer to analyze quiz funnels and generate A/B tests</p>
              <Button onClick={handleRunFunnelOptimizer} disabled={agentStates.funnelOptimizer.loading} size="sm">
                {agentStates.funnelOptimizer.loading ? <FiLoader className="mr-2 animate-spin" size={14} /> : <FiTarget className="mr-2" size={14} />}
                Optimize Funnels
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  function renderSection() {
    switch (activeSection) {
      case 'command': return renderCommandCenter()
      case 'hooks': return renderHookBank()
      case 'scripts': return renderScriptQueue()
      case 'render': return renderRenderPipeline()
      case 'distribution': return renderDistributionCalendar()
      case 'analytics': return renderAnalyticsDashboard()
      case 'funnel': return renderFunnelLab()
      default: return renderCommandCenter()
    }
  }

  return (
    <InlineErrorBoundary>
      <div className="min-h-screen bg-background text-foreground flex">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-56'} flex-shrink-0 bg-card border-r border-border/30 flex flex-col transition-all duration-300 h-screen sticky top-0`}>
          <div className="p-4 border-b border-border/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <FiActivity size={16} className="text-primary-foreground" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <h1 className="font-serif text-sm font-bold tracking-wide leading-tight">Media Command</h1>
                  <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Parenting Content</p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.key
              const agentState = agentStates[item.agentKey]
              return (
                <button key={item.key} onClick={() => setActiveSection(item.key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-secondary/60'}`}>
                  <span className="flex-shrink-0"><NavIcon name={item.iconName} size={18} /></span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="font-medium text-xs tracking-wide truncate">{item.label}</span>
                      {agentState.loading && <FiLoader size={12} className="ml-auto animate-spin flex-shrink-0" />}
                      {!agentState.loading && agentState.error && <div className="w-2 h-2 rounded-full bg-red-500 ml-auto flex-shrink-0" />}
                      {!agentState.loading && agentState.lastRun && !agentState.error && <div className="w-2 h-2 rounded-full bg-green-500 ml-auto flex-shrink-0" />}
                    </>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="p-2 border-t border-border/20">
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-secondary/40 transition-colors">
              {sidebarCollapsed ? <FiChevronRight size={14} /> : <><FiChevronDown size={14} className="rotate-90" /><span>Collapse</span></>}
            </button>
          </div>

          {!sidebarCollapsed && (
            <div className="p-3 border-t border-border/20">
              <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">Agent Status</h4>
              <div className="space-y-1">
                {(Object.keys(AGENT_IDS) as AgentKey[]).map(key => (
                  <div key={key} className="flex items-center gap-2 text-[10px]">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${agentStates[key].loading ? 'bg-blue-500 animate-pulse' : agentStates[key].error ? 'bg-red-500' : agentStates[key].lastRun ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={`truncate ${activeAgentId === AGENT_IDS[key] ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{key}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 h-screen">
          <header className="bg-card border-b border-border/30 px-6 py-3 flex-shrink-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4 flex-wrap">
                <h2 className="text-xl font-serif font-bold tracking-wide">{sectionTitles[activeSection]}</h2>
                <div className="flex items-center bg-secondary/40 rounded-lg p-0.5">
                  {(['all', 'newborns', 'toddlers', 'teenagers'] as BrandKey[]).map(brand => (
                    <button key={brand} onClick={() => setActiveBrand(brand)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 capitalize ${activeBrand === brand ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                      {brand === 'all' ? 'All Brands' : brand}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground cursor-pointer select-none">Sample Data</Label>
                <Switch id="sample-toggle" checked={showSampleData} onCheckedChange={setShowSampleData} />
              </div>
            </div>
          </header>

          {statusMsg && (
            <div className="px-6 pt-3 flex-shrink-0">
              <StatusMessage message={statusMsg.message} type={statusMsg.type} />
            </div>
          )}

          {activeAgentId && (
            <div className="px-6 pt-2 flex-shrink-0">
              <div className="flex items-center gap-2 text-xs text-primary">
                <FiLoader size={12} className="animate-spin" />
                <span>Agent processing...</span>
              </div>
            </div>
          )}

          {(Object.entries(agentStates) as [AgentKey, AgentState][]).map(([key, state]) => {
            if (!state.error) return null
            return (
              <div key={key} className="px-6 pt-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  <FiAlertTriangle size={12} />
                  <span className="font-medium capitalize">{key}:</span>
                  <span className="truncate">{state.error}</span>
                  <button onClick={() => setAgentStates(prev => ({ ...prev, [key]: { ...prev[key], error: null } }))} className="ml-auto p-0.5 hover:bg-red-100 rounded flex-shrink-0">
                    <FiX size={10} />
                  </button>
                </div>
              </div>
            )
          })}

          <ScrollArea className="flex-1">
            <div className="p-6">
              {renderSection()}
            </div>
          </ScrollArea>
        </main>
      </div>
    </InlineErrorBoundary>
  )
}
