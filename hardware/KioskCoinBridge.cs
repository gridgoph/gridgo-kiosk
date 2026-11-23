using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace GridGo.Kiosk.Hardware;

/// <summary>
/// Posts coin-acceptor events to the GRIDGO API while the kiosk pay screen is open.
/// Call <see cref="InsertAsync"/> from the acceptor callback. Denominations are
/// centavos: 100 (₱1), 500 (₱5), 1000 (₱10), 2000 (₱20).
///
/// POST {apiBase}/api/kiosk/hardware/coins
/// Header X-Kiosk-Coin-Key: the key shown on Super Admin → Kiosk
/// Body {"denominationMinor":1000,"eventId":"..."}
///
/// GET {apiBase}/api/kiosk/hardware/status
/// tells the service whether a customer is paying and how much is still due.
/// </summary>
public sealed class KioskCoinBridge : IDisposable
{
    private readonly HttpClient _http;
    private readonly string _apiBase;

    public KioskCoinBridge(string apiBase, string coinKey)
    {
        _apiBase = apiBase.TrimEnd('/');
        _http = new HttpClient();
        _http.DefaultRequestHeaders.TryAddWithoutValidation("X-Kiosk-Coin-Key", coinKey);
        _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<HardwareStatus> ReadStatusAsync(CancellationToken cancellationToken = default)
    {
        using var response = await _http.GetAsync($"{_apiBase}/api/kiosk/hardware/status", cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode) throw new InvalidOperationException(body);
        return JsonSerializer.Deserialize<HardwareStatus>(body, Json.Options)
            ?? throw new InvalidOperationException("The kiosk status was empty.");
    }

    public async Task InsertAsync(int denominationMinor, CancellationToken cancellationToken = default)
    {
        var payload = JsonSerializer.Serialize(new
        {
            denominationMinor,
            eventId = Guid.NewGuid().ToString("N"),
        });
        using var content = new StringContent(payload, Encoding.UTF8, "application/json");
        using var response = await _http.PostAsync($"{_apiBase}/api/kiosk/hardware/coins", content, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode) throw new InvalidOperationException(body);
    }

    public void Dispose() => _http.Dispose();

    private static class Json
    {
        public static readonly JsonSerializerOptions Options = new() { PropertyNameCaseInsensitive = true };
    }
}

public sealed class HardwareStatus
{
    public bool Accepting { get; set; }
    public string? SessionId { get; set; }
    public string? OrderCode { get; set; }
    public int AmountDueMinor { get; set; }
    public int InsertedMinor { get; set; }
    public int RemainingMinor { get; set; }
}
