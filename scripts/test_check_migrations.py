"""Negative controls for check_migrations.py.

A checker that only ever passes is the bug this repo keeps rediscovering:
Keya's anonymous check asserting zero rows without confirming any existed,
Sivathmika's validator passing on an empty CSV, sync_issues.py listing only
open issues. So each check here is proved to fail on the exact mistake it
exists to catch, not just to pass on a clean tree.

    python3 scripts/test_check_migrations.py
"""

import tempfile
import unittest
from pathlib import Path

from check_migrations import check_filenames_and_numbers, check_references


class FilenameAndNumberTests(unittest.TestCase):
    def _dir_with(self, *names: str) -> Path:
        tmp = Path(tempfile.mkdtemp())
        for name in names:
            (tmp / name).write_text("-- test\n", encoding="utf-8")
        return tmp

    def test_passes_on_unique_well_formed_numbers(self):
        d = self._dir_with("0001_init.sql", "0002_add_a_thing.sql")
        self.assertEqual(check_filenames_and_numbers(d), [])

    def test_fails_when_two_migrations_share_a_number(self):
        # The real 29 Sep collision: #218 and #229 both landed on 0010.
        d = self._dir_with("0010_ask_daily_usage.sql", "0010_ask_message_feedback.sql")
        errors = check_filenames_and_numbers(d)
        self.assertEqual(len(errors), 1)
        self.assertIn("share the number 0010", errors[0])
        self.assertIn("0010_ask_daily_usage.sql", errors[0])
        self.assertIn("0010_ask_message_feedback.sql", errors[0])

    def test_fails_on_a_malformed_filename(self):
        d = self._dir_with("add_a_thing.sql")
        errors = check_filenames_and_numbers(d)
        self.assertEqual(len(errors), 1)
        self.assertIn("bad migration filename", errors[0])

    def test_fails_when_the_directory_is_missing(self):
        # Not a vacuous pass: no directory is a problem, not a clean result.
        errors = check_filenames_and_numbers(Path("/nonexistent/migrations"))
        self.assertEqual(len(errors), 1)
        self.assertIn("does not exist", errors[0])


class ReferenceTests(unittest.TestCase):
    def _file(self, body: str) -> tuple[Path, list[Path]]:
        tmp = Path(tempfile.mkdtemp())
        f = tmp / "some_test.sql"
        f.write_text(body, encoding="utf-8")
        return tmp, [f]

    def test_passes_when_the_reference_resolves(self):
        root, files = self._file("-- proof that 0012_temperature_readings_range.sql works\n")
        self.assertEqual(
            check_references({"0012_temperature_readings_range.sql"}, files, root), []
        )

    def test_fails_on_a_reference_to_a_renumbered_migration(self):
        # The real one: the header still said 0010 after the file became 0012,
        # and 0010 by then was a different migration entirely.
        root, files = self._file("-- proof that 0010_temperature_readings_range.sql works\n")
        errors = check_references({"0012_temperature_readings_range.sql"}, files, root)
        self.assertEqual(len(errors), 1)
        self.assertIn("0010_temperature_readings_range.sql", errors[0])
        self.assertIn("does not exist", errors[0])

    def test_reports_every_stale_reference_not_just_the_first(self):
        root, files = self._file(
            "-- see 0009_ask_message_feedback.sql\n"
            "-- and 0011_temperature_readings_range.sql\n"
        )
        errors = check_references({"0012_temperature_readings_range.sql"}, files, root)
        self.assertEqual(len(errors), 2)


if __name__ == "__main__":
    unittest.main()
