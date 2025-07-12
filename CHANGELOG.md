# Change Log

## 0.5.0-rc22 (2024-07-12)

### UPDATES FOR LATEST ISY-NODEJS AND HOMEBRIDGE 2.0 COMPATIBILITY

    1. Fixed TypeScript compilation errors for modern TypeScript versions
    2. Updated build process to support latest toolchain
    3. Improved type safety for fan speed conversions and characteristic handling
    4. Added homebridge 2.0 compatibility in package.json engines field
    5. Fixed module import issues and UUID property access
    6. Added build artifacts to .gitignore
    7. Maintained compatibility with isy-nodejs@0.5.0-beta.55 (latest stable beta)

## 0.5.0-rc21 (7-16-2020)

### MINOR FIXES - UPDATES FOR ZWAVE ISSUES AND FATAL ERRORS IN FUTURE RELEASE

    1. Fixed issues with response back to HomeKit
    2. Fixed scene status update issues

## 0.5.0-rc12 (7-12-2020)

    1. Garage Door Init issues
    2. FanLinc Light is excluded frosm HomeKit when not present
    3. FanLinc Speed is now adjusted in increments of 33%

## 0.5.0-rc11 (6-25-2020)

    1. ISY connectivity issues will no longer cause devices to deregister from homebridge
    2. Garage Door status sensor refresh no longer throws error

## 0.5.0-rc9

### BUGFIXES

    1. Leak sensor status inverted
    2. Issue with brightness level and on/off state refreshing correctly

## 0.5.0-rc7

    BUGFIX - Handling for unidentified relays/dimmers.

## 0.5.0-rc6

    BUGFIX - Response not detected when setting characteristics