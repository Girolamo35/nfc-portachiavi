import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPassword) {
    return new NextResponse('Admin non configurato', {
      status: 500,
    });
  }

  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return new NextResponse('Accesso richiesto', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Area Admin NFC"',
      },
    });
  }

  const encodedCredentials = authHeader.split(' ')[1];

  if (!encodedCredentials) {
    return new NextResponse('Accesso negato', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Area Admin NFC"',
      },
    });
  }

  const decodedCredentials = atob(encodedCredentials);
  const [username, password] = decodedCredentials.split(':');

  if (username !== adminUser || password !== adminPassword) {
    return new NextResponse('Credenziali errate', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Area Admin NFC"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};