import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const res = await fetch(
      "https://www.febbox.com/console/video_quality_list?fid=47092463",
      {
        method: "GET",
        headers: {
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "en-US,en;q=0.8",

          Referer: "https://www.febbox.com/console",

          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",

          "X-Requested-With": "XMLHttpRequest",

          Cookie:
            'show_mode=; share_file_mode=grid2; ci=98e9d195fd72195760dafe1b2551423f; PHPSESSID=f3j8bqnmmh7gsnrjo3ivsqc7m2; g_state={"i_l":0,"i_ll":1784918868164,"i_b":"K+GbWkCYq4wQrLUriHUEygG61xmPv91v7hrG5JWnZvY","i_e":{"enable_itp_optimization":24},"i_et":1784918868164}; ui=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3ODQ5MTg5NTIsIm5iZiI6MTc4NDkxODk1MiwiZXhwIjoxODE2MDIyOTcyLCJkYXRhIjp7InVpZCI6MTk0MjU1NSwidG9rZW4iOiI5OGU5ZDE5NWZkNzIxOTU3NjBkYWZlMWIyNTUxNDIzZiJ9fQ.4vwhf-Sic_IKn1K_Rh_ddGWU6pE3X7-6R8yWCf3UHoo; cf_clearance=ECrN5SNhp.dG4E0lrPVDAgkGSfa88UXSbdao4E23vI4-1784919691-1.2.1.1-hAehJX5FkZZLRaESAjqxsls1Kk8b2JZLeK1eXaPHeE9JEgm1EQVf3PbjdlUDQF2zg185nWCYw0VdGzd1b97uWx5EZgxjBgUn7VgwURg5kXJk9x3Nc2PpfPUboh8weP82mtPkhcBTx4IHG6dnjqHp5w7c_ioDvvY8oeOedUWizujloFHxD3f2DXeX6qkxzgmQrdXTC55gXB9mvDql6GHGZlTnOw0tRiit1NdK_hAiwS.Hwxb6a_QY3YtMgcVAQoaMvVGShIz7LFFhyBJwWtrASn1p3rD.MBy8Kd7_fHzsAWF4J47T7PNMLyuCqoYlXRw3Pfynlv6OO82XlM06MZ7IrfLB6r5OAqWgWt9cY4gdsWA',
        },
      },
    );

    const data = await res.json();

    return NextResponse.json({
      success: res.ok,
      status: res.status,
      data,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        success: false,
        error: e.message,
      },
      { status: 500 },
    );
  }
}
