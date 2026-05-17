// 공개 가능한 클라이언트 설정.
// - SUPABASE_ANON_KEY: 공개 키. RLS 로 보호되므로 노출 무방.
// - GATE_PASSWORD_SHA256: 평문 노출 방지 위해 SHA-256 해시만 저장.
//   비밀번호를 바꾸려면 아래 1줄 명령으로 새 해시를 만들어 교체하면 됨:
//     node -e "console.log(require('crypto').createHash('sha256').update('새비밀번호','utf8').digest('hex'))"
window.SITE_CONFIG = {
  SUPABASE_URL: "https://asdzuprhcovxifolvaxa.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_mLMfg8ept4RmsOo2uzW5vg_rYYjgaC1",
  GATE_PASSWORD_SHA256:
    "2650d1532a03648f9c48785d42864d786e8721b7795380c3bce0fd09890437e1",
};
