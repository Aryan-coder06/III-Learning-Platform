#include <bits/stdc++.h>
using namespace std;

#define ll long long
#define ull unsigned long long
#define lld long double
#define ld long double

#define pb push_back
#define ppb pop_back
#define mp make_pair
#define ff first
#define ss second
#define all(x) (x).begin(), (x).end()
#define sz(x) ((int)(x).size())

#define rep(i,a,b) for (int i = a; i < b; ++i)
#define rrep(i,a,b) for (int i = a; i >= b; --i)

#define fastio() ios_base::sync_with_stdio(false); cin.tie(NULL)
#define endl '\n'
#define vec vector

#define yes cout << "YES\n"
#define no cout << "NO\n"

#define INF 1e18
#define MOD 1000000007
#define PI 3.141592653589793238462
#define setbits(x) __builtin_popcountll(x)

typedef vector<int> vi;
typedef vector<char> vc;
typedef vector<ll> vl;
typedef vector<vector<int>> vvi;
typedef vector<vector<ll>> vvl;
typedef pair<int,int> pi;
typedef pair<ll,ll> pl;
typedef vector<pi> vpi;
typedef vector<pl> vpl;
typedef vector<ull> vul;
typedef vector<char> vcc;
typedef vector<vector<char>> vvc;

#ifndef ONLINE_JUDGE
#else
#define debug(x)
#endif

void _print(int t) {cerr << t;}
void _print(ll t) {cerr << t;}
void _print(string t) {cerr << t;}
void _print(char t) {cerr << t;}
void _print(lld t) {cerr << t;}
void _print(double t) {cerr << t;}
void _print(ull t) {cerr << t;}

template <class T, class V> void _print(pair<T, V> p);
template <class T> void _print(vector<T> v);
template <class T> void _print(set<T> v);
template <class T> void _print(multiset<T> v);
template <class T, class V> void _print(map<T, V> v);

template <class T, class V> void _print(pair<T, V> p) {
    cerr << "{"; _print(p.ff); cerr << ","; _print(p.ss); cerr << "}";
}
template <class T> void _print(vector<T> v) {
    cerr << "[ "; for (T i : v) {_print(i); cerr << " ";} cerr << "]";
}
template <class T> void _print(set<T> v) {
    cerr << "[ "; for (T i : v) {_print(i); cerr << " ";} cerr << "]";
}
template <class T> void _print(multiset<T> v) {
    cerr << "[ "; for (T i : v) {_print(i); cerr << " ";} cerr << "]";
}
template <class T, class V> void _print(map<T, V> v) {
    cerr << "[ "; for (auto i : v) {_print(i); cerr << " ";} cerr << "]";
}
template <class T> void cin_v(vector<T> &v) { for (auto &x : v) cin >> x; }


ll gcd(ll a, ll b) {
    while (b) a %= b, swap(a, b);
    return a;
}

ll lcm(ll a, ll b) {
    return a / gcd(a, b) * b;
}

ll power(ll a, ll b, ll mod = MOD) {
    ll res = 1; a %= mod;
    while (b > 0) {
        if (b & 1) res = res * a % mod;
        a = a * a % mod;
        b >>= 1;
    }
    return res;
}

ll invmod(ll a, ll mod = MOD) {
    return power(a, mod - 2, mod);
}

bool isPrime(ll n) {
    if (n < 2) return false;
    if (n < 4) return true;
    if (n % 2 == 0 || n % 3 == 0) return false;
    ll d = n - 1, s = 0;
    while (d % 2 == 0) d /= 2, ++s;
    vector<ll> bases = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37};
    for (ll a : bases) {
        if (a >= n) break;
        ll x = power(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (ll r = 1; r < s; ++r) {
            x = (__int128)x * x % n;
            if (x == n - 1) {
                composite = false;
                break;
            }
        }
        if (composite) return false;
    }
    return true;
}


double multiply(double mid, int p) {
    double result = 1.0;
    rep(i,0,p) {
        result *= mid;
    }
    return result;
}

double eps = 1e-7;


//TC : p*log(N*(10^d)) where d is the precison
double pthrootofN(double n, int p) {
    double lo = 1, hi = n, mid;
    while (hi - lo > eps) {
        mid = lo + (hi - lo) / 2;
        if (multiply(mid, p) < n) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    cout << fixed << setprecision(10) << lo << endl;
    return lo;
}




// --- Prime Sieve --- 
const int N =200000;
vector<bool> is_prime;
vector<int> lp(N, 0), hp(N, 0);
vector<int> primes;

void sieve(int maxn = 1e7) {
    is_prime.assign(maxn + 1, true);
    is_prime[0] = is_prime[1] = false;
    for (int i = 2; i * i <= maxn; ++i) {
        if (is_prime[i]) {
            lp[i] = hp[i] = i;
            for (int j = i * i; j <= maxn; j += i) {
                is_prime[j] = false;
                hp[j] = i;
                if (lp[j] == 0) lp[j] = i;
            }
        }
    }
    for (int i = 2; i <= maxn; i++) {
        if (is_prime[i]) {
            lp[i] = hp[i] = i;
            primes.push_back(i);
        }
    }
}

vector<int> getPrimeFactors(int num) {
    vector<int> prime_factors;
    while (num > 1) {
        int curr_prime = hp[num];
        while (num % curr_prime == 0) {
            num /= curr_prime;
            prime_factors.push_back(curr_prime);
        }
    }
    return prime_factors;
}

// --- Divisor Sieve --- 
const int M = 1e5 + 10;
vi divisors[M];

void divsieve() {
    for (int i = 2; i < M; i++) {
        for (int j = i; j < M; j += i) {
            divisors[j].push_back(i);
        }
    }
    for(int i =1; i< 10; ++i) {
        for(int div: divisors[i]) {
            cout << div << " ";
        }
    }
}

tuple<ll, int, int> kadane_with_indices(const vl &a) {
    ll max_sum = a[0], cur = a[0];
    int start = 0, end = 0, temp_start = 0;
    rep(i, 1, a.size()) {
        if (cur + a[i] < a[i]) {
            cur = a[i];
            temp_start = i;
        } else {
            cur += a[i];
        }
        if (cur > max_sum) {
            max_sum = cur;
            start = temp_start;
            end = i;
        }
    }
    return {max_sum, start, end};
}

struct DSU {
    vi parent, size;
    DSU(int n) {
        parent.resize(n);
        size.assign(n, 1);
        iota(all(parent), 0);
    }
    int find(int x) {
        return x == parent[x] ? x : parent[x] = find(parent[x]);
    }
    bool unite(int x, int y) {
        x = find(x); y = find(y);
        if (x == y) return false;
        if (size[x] < size[y]) swap(x, y);
        parent[y] = x;
        size[x] += size[y];
        return true;
    }
};
ll modmul(ll a, ll b) {
    return (a % MOD) * (b % MOD) % MOD;
}

ll modpow(ll a, ll e, ll mod) {
    ll r = 1 % mod;
    a %= mod;
    while (e > 0) {
        if (e & 1) r = (__int128)r * a % mod;
        a = (__int128)a * a % mod;
        e >>= 1;
    }
    return r;
}

bool mygcd(vi& nums) {
    int val = 0;
    for(auto it: nums) {
        val = __gcd(val , it);
    }
    return val != 1;
}

void dfs(int node , vector<vi>& adj , vi& vis , vi& ls) {
    vis[node] = 1;
    ls.pb(node);
    for (int it : adj[node]) {
        if (!vis[it]) {
            dfs(it, adj, vis, ls);
        }
    }
}


// Binary Exponentiation and Modular Arithmetic
/*
Key Properties for (a,b) % M:
    (a + b) % M = ((a % M) + (b % M)) % M
    (a - b) % M = ((a % M) - (b % M) + M) % M  // add M to handle negative
    (a * b) % M = ((a % M) * (b % M)) % M
    (a / b) % M = (a * modInverse(b, M)) % M   // only when M is prime

Cases for a^b % M:
1. a,b,M <= 1e9: Use basic binExp()
2. a <= 1e18: Add a = a % M before loop
3. M <= 1e18: Use binMult() to handle a*a overflow
4. b <= 1e18: Use Euler's theorem:
   - For prime M: a^b % M = a^(b % (M-1)) % M
   - For composite M: a^b % M = a^(b % φ(M)) % M where φ is Euler totient

ModInverse:
- When M is prime, modInverse(a,M) = binExp(a,M-2,M) (Fermat's Little Theorem)
- a * modInverse(a,M) ≡ 1 (mod M)
*/

// Basic binary exponentiation for smaller numbers
int binExp(int a, int b, int m) {
    int ans = 1;
    a %= m;
    while(b) {
        if(b&1) ans = (ans * 1LL * a) % m;
        a = (a * 1LL * a) % m;
        b >>= 1;
    }
    return ans;
}

ll binMult(ll a, ll b, ll m) {
    ll ans = 0;
    a %= m;
    while(b) {
        if(b&1) ans = (ans + a) % m;
        a = (2 * a) % m;
        b >>= 1;
    }
    return ans;
}

// Modular Inverse using Fermat's Little Theorem
ll modInverse(ll a, ll M) {
    return binExp(a, M-2, M);
}

void printing(const vector<int>& cur) {
    if (cur.empty()) {
        cout << "{}\n";
        return;
    }
    for (int x : cur) cout << x << ' ';
    cout << '\n';
}

void printSubsequenceMask(const vector<int>& a) {
    int n = a.size();
    for (int mask = 0; mask < (1 << n); mask++) {
        bool any = false;
        for (int i = 0; i < n; i++) {
            if (mask & (1 << i)) {
                cout << a[i] << ' ';
                any = true;
            }
        }
        if (!any) cout << "{}";
        cout << '\n';
    }
}

void printSubsequence(const vector<int>& arr, int idx, vector<int>& cur) {
    if (idx == (int)arr.size()) {
        printing(cur);
        return;
    }
    printSubsequence(arr, idx + 1, cur);
    cur.push_back(arr[idx]);
    printSubsequence(arr, idx + 1, cur);
    cur.pop_back();
}


void solve() {
            
        string s ="Finallyaaaadnjadkandjkanjkdankdnasjkdnjakndknkajdn";
        cout<<s.size()<<endl;    
}

int32_t main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t; if(!(cin >> t)) t = 1; while(t--) solve();
    return 0;
}