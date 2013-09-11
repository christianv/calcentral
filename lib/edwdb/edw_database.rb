class EdwDatabase < ActiveRecord::Base
  # WARNING: Default Rails SQL query caching (done for the lifetime of a controller action) apparently does not apply
  # to anything but the primary DB connection. Any Oracle query caching needs to be handled explicitly.
  establish_connection "edwqa"

end
