import unittest
from unittest.mock import patch

from btb_rls_check import check_admin_fixtures_present


class AdminFixturePresenceTests(unittest.TestCase):
    @patch("btb_rls_check.request_json", return_value=True)
    def test_passes_when_both_sentinels_exist(self, request):
        self.assertTrue(
            check_admin_fixtures_present(
                "https://example.supabase.co",
                "publishable-key",
                "account-token",
            )
        )
        request.assert_called_once_with(
            "https://example.supabase.co/rest/v1/rpc/rls_fixtures_present",
            {
                "apikey": "publishable-key",
                "Authorization": "Bearer account-token",
            },
            {},
        )

    @patch("btb_rls_check.request_json", return_value=False)
    def test_negative_control_fails_when_a_sentinel_is_missing(self, _request):
        self.assertFalse(
            check_admin_fixtures_present(
                "https://example.supabase.co",
                "publishable-key",
                "account-token",
            )
        )


if __name__ == "__main__":
    unittest.main()
