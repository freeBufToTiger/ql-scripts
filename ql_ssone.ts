import { Env } from './utils';

const $ = new Env('ssone机场签到');

async function getHost() {
  return process.env.V2BOARD_HOST || 'https://m.ssonecloud.com/';
}

export async function signCheckIn(cfg: string) {
  const [email, passwd, HOST = await getHost()] = cfg.split('#');
  const url = {
    login: `${HOST}/api/?action=login`,
    checkin: `${HOST}/skyapi?action=checkin`,
  };
  let cookie = passwd ? '' : email;
  // @ts-ignore
  Object.entries(url).forEach(([key, value]) => (url[key] = value.replaceAll('//', '/')));

  if (!cookie) {
    const { data, headers } = await $.req.get(url.login, { email, password: passwd });
    if (data.data) {
      $.req.setCookie(`auth=${data.data}`);
      cookie = headers['set-cookie']!.map(d => d.split(';')[0]).join(';');
      $.log(data.msg || `登录成功！`);
    } else {
        console.log(data);
      $.log(data.msg || `登录失败！`, 'error');
      return;
    }
  }

  $.req.setCookie(cookie);

  const { data } = await $.req.get(url.checkin);
  if (data.ret === 1 || String(data.message).includes('Already')) {
    $.log(`签到成功！${data.message}`);
  } else {
    $.log(`❌签到失败：${data.message}`, 'error');
  }
}

// process.env.SSONE = '';
if (require.main === module) $.init(signCheckIn, 'SSONE').then(() => $.done());
