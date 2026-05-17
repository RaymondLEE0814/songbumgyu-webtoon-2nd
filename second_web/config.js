// 공개 가능한 클라이언트 설정.
// - SUPABASE_ANON_KEY: 공개 키. RLS 로 보호되므로 노출 무방.
// - GATE_PASSWORD: 게이트(공유 비밀번호) 평문.
//   "캐주얼 차단" 용도라 평문으로 둠. anon key 가 이미 공개이므로 실제 방벽은 RLS.
//   바꾸려면 이 한 줄만 교체 후 push.
window.SITE_CONFIG = {
  SUPABASE_URL: "https://asdzuprhcovxifolvaxa.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_mLMfg8ept4RmsOo2uzW5vg_rYYjgaC1",
  GATE_PASSWORD: "1234",
};
